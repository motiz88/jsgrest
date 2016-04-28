import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToOffsetLimit from '../query/requestToOffsetLimit';
import sql, {join as joinSql, raw as rawSql} from '../sqlTemplate';
import prepareSqlValue from '../prepareSqlValue';
import pgEscape from 'pg-escape';

export default function requestToInvokeStatement(req) {
    const qualifiedRelationQuoted = rawSql(requestToQualifiedRelationQuoted(req));
    const {offset, limit} = requestToOffsetLimit(req);

    const argumentsQuoted = req.body ? joinSql(Object.keys(req.body)
        .map(key => sql `${rawSql(pgEscape.ident(key))} := ${prepareSqlValue(req.body[key])}`)
    ) : sql ``;

    const selectQuery = sql`
        SELECT * FROM ${qualifiedRelationQuoted}(${argumentsQuoted})
    `;

    const countExpression = req.flags.preferCount ? sql`
        (SELECT pg_catalog.count(1) FROM t)
    ` : sql `null::bigint`;

    const bodyExpression = sql` array_to_json(
        coalesce(array_agg(row_to_json(r)), '\{}')
    )::character varying`;

    const cols = sql`
        ${countExpression} AS total_result_set,
        pg_catalog.count(1) AS page_total,
        ${bodyExpression} AS body
    `;

    return sql`
        WITH t AS (${selectQuery}) SELECT ${cols}
        FROM ( SELECT * FROM t OFFSET ${offset || 0} LIMIT ${limit} ) r
    `;
}
