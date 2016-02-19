import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';
import pgEscape from 'pg-escape';
import sql, {join as joinSql, raw as rawSql} from '../sqlTemplate';

export default function requestToUpdateStatement(req) {
    const qualifiedRelationQuoted = rawSql(requestToQualifiedRelationQuoted(req));
    if (!req.body)
        throw new Error('PATCH request must have a body');

    const assignmentsQuoted = joinSql(Object.keys(req.body)
        .map(key => sql `${rawSql(pgEscape.ident(key))} = ${req.body[key]}`)
    );
    if (!assignmentsQuoted.text.length)
        return new Error('PATCH request body must set at least one field');

    const whereClause = requestToWhereClause(req);

    const bodyExpression = req.flags.preferSingular ? sql `
        coalesce(string_agg(row_to_json(t)::text, ','), '')::character varying
    ` : sql `
        coalesce(array_to_json(array_agg(row_to_json(t))), '[]')::character varying
    `;

    const returning = rawSql(
        req.flags.preferRepresentation !== 'headersOnly' ? ' RETURNING *' : ''
    );

    const updateSubquery = sql
        `UPDATE ${qualifiedRelationQuoted} SET ${assignmentsQuoted} ${whereClause} ${returning}`;

    return req.flags.preferRepresentation !== 'full' ?
        updateSubquery
        : sql `
            WITH t AS (${updateSubquery})
            SELECT ${bodyExpression} as body from t
        `;
}
