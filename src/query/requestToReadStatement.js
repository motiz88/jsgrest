import wrap from '../wrap';
import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';
import requestToOrderClause from '../query/requestToOrderClause';
import requestToOffsetLimit from '../query/requestToOffsetLimit';

export default function requestToReadStatement(req) {
    const qualifiedRelationQuoted = requestToQualifiedRelationQuoted(req);
    const whereClause = requestToWhereClause(req);
    const orderClause = requestToOrderClause(req);
    const {offset, limit} = requestToOffsetLimit(req);

    const selectQuery = `
        SELECT * FROM ${qualifiedRelationQuoted} ${whereClause} ${orderClause}
    `;

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

    return [`
        WITH pg_source AS (${selectQuery}) SELECT ${cols}
        FROM ( SELECT * FROM pg_source OFFSET $1 LIMIT $2 ) t
    `, offset || 0, limit];
}
