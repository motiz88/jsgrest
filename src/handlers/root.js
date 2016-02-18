import wrap from '../wrap';
import requestToOffsetLimit from '../query/requestToOffsetLimit';
import requestToOrderClause from '../query/requestToOrderClause';
import sql, {join as joinSql, raw as rawSql} from '../sqlTemplate';

export default wrap(async function rootHandler(req, res, next) {
    const qualifiedRelationQuoted = sql `pg_class c
            join pg_namespace n on n.oid = c.relnamespace
    `;
    const whereClause = sql `where
        c.relkind in ('v', 'r', 'm')
        and n.nspname = ${req.dbConfig.schema}
        and (
            pg_has_role(c.relowner, 'USAGE'::text)
            or has_table_privilege(
                c.oid,
                'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'::text
            )
            or has_any_column_privilege(c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'::text)
        )`;
    const orderClause = rawSql(requestToOrderClause(req) || `order by relname`);
    const {offset, limit} = requestToOffsetLimit(req);
    const selectQuery = sql `select
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
    const countExpression = req.flags.preferCount ? sql `
        (SELECT pg_catalog.count(1) FROM ${qualifiedRelationQuoted} ${whereClause})
    ` : sql `null`;

    const bodyExpression = req.flags.preferSingular ? sql `
        coalesce(string_agg(row_to_json(t)::text, ','), '')::character varying
    ` : sql `
        coalesce(array_to_json(array_agg(row_to_json(t))), '[]')::character varying
    `;

    const cols = sql `
        ${countExpression} AS total_result_set,
        pg_catalog.count(t) AS page_total,
        '' AS header,
        ${bodyExpression} AS body
    `;

    await res.sendSelectQuery(sql `
        WITH pg_source AS (${selectQuery}) SELECT ${cols}
        FROM ( SELECT * FROM pg_source OFFSET ${offset || 0} LIMIT ${limit}) t
    `);
    next();
});
