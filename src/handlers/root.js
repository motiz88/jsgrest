import wrap from '../wrap';
import requestToOffsetLimit from '../query/requestToOffsetLimit';
import requestToOrderClause from '../query/requestToOrderClause';

export default wrap(async function rootHandler(req, res, next) {
    const qualifiedRelationQuoted = `pg_class c
            join pg_namespace n on n.oid = c.relnamespace
    `;
    const whereClause = `where
        c.relkind in ('v', 'r', 'm')
        and n.nspname = $1
        and (
            pg_has_role(c.relowner, 'USAGE'::text)
            or has_table_privilege(
                c.oid,
                'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'::text
            )
            or has_any_column_privilege(c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'::text)
        )`;
    const orderClause = requestToOrderClause(req) || `order by relname`;
    const {offset, limit} = requestToOffsetLimit(req);
    const selectQuery = `select
        n.nspname as schema,
        relname as name,
        c.relkind = 'r' or (c.relkind IN ('v', 'f')) and
            (pg_relation_is_updatable(c.oid::regclass, false) & 8) = 8
        or (exists (
            select 1
            from pg_trigger
            where pg_trigger.tgrelid = c.oid and (pg_trigger.tgtype::integer & 69) = 69)
        ) as insertable
        from
        ${qualifiedRelationQuoted}
        ${whereClause}
        ${orderClause}`;
    const countExpression = req.flags.preferCount ? `
        (SELECT pg_catalog.count(1) FROM ${qualifiedRelationQuoted} ${whereClause})
    ` : 'null';

    const bodyExpression = req.flags.preferSingular ? `
        coalesce(string_agg(row_to_json(t)::text, ','), '')::character varying
    ` : `
        coalesce(array_to_json(array_agg(row_to_json(t))), '[]')::character varying
    `;

    const cols = `
        ${countExpression} AS total_result_set,
        pg_catalog.count(t) AS page_total,
        '' AS header,
        ${bodyExpression} AS body
    `;

    await res.sendSelectQuery(`
        WITH pg_source AS (${selectQuery}) SELECT ${cols}
        FROM ( SELECT * FROM pg_source OFFSET $2 LIMIT $3) t
    `, req.dbConfig.schema, offset || 0, limit);
    next();
});
