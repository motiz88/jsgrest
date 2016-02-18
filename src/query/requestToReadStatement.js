import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';
import requestToOrderClause from '../query/requestToOrderClause';
import requestToOffsetLimit from '../query/requestToOffsetLimit';
import requestToColumnList from '../query/requestToColumnList';
import sql, {raw as rawSql} from '../sqlTemplate';

export default function requestToReadStatement(req) {
    const qualifiedRelationQuoted = rawSql(requestToQualifiedRelationQuoted(req));
    const whereClause = requestToWhereClause(req);
    const orderClause = rawSql(requestToOrderClause(req));
    const selectColumns = rawSql(requestToColumnList(req));
    const {offset, limit} = requestToOffsetLimit(req);

    const selectQuery = sql`
        SELECT ${selectColumns} FROM ${qualifiedRelationQuoted} ${whereClause} ${orderClause}
    `;

    const countExpression = req.flags.preferCount ? sql`
        (SELECT pg_catalog.count(1) FROM ${qualifiedRelationQuoted} ${whereClause})
    ` : sql `null`;

    const bodyExpression = req.flags.preferSingular ? sql `
        coalesce(string_agg(row_to_json(t)::text, ','), '')::character varying
    ` : sql `
        coalesce(array_to_json(array_agg(row_to_json(t))), '[]')::character varying
    `;

    const cols = sql`
        ${countExpression} AS total_result_set,
        pg_catalog.count(t) AS page_total,
        '' AS header,
        ${bodyExpression} AS body
    `;

    return sql`
        WITH pg_source AS (${selectQuery}) SELECT ${cols}
        FROM ( SELECT * FROM pg_source OFFSET ${offset || 0} LIMIT ${limit} ) t
    `;
}
