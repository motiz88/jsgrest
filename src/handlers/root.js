import wrap from '../wrap';

export default wrap(async function rootHandler(req, res) {
    const accessibleTablesQuery = `select
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
            pg_class c
            join pg_namespace n on n.oid = c.relnamespace
        where
        c.relkind in ('v', 'r', 'm')
        and n.nspname = $1
        and (
            pg_has_role(c.relowner, 'USAGE'::text)
            or has_table_privilege(
                c.oid,
                'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'::text
            )
            or has_any_column_privilege(c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'::text)
        )
        order by relname`;

    await res.sendSelectQuery(accessibleTablesQuery, req.dbConfig.schema);
});
