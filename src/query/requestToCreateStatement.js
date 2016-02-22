import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import pgEscape from 'pg-escape';
import sql, {join as joinSql, raw as rawSql} from '../sqlTemplate';
import requestToColumnList from '../query/requestToColumnList';
import prepareSqlValue from '../prepareSqlValue';

export default function requestToCreateStatement(req) {
    const qualifiedRelationQuoted = rawSql(requestToQualifiedRelationQuoted(req));
    if (!req.body)
        throw new Error('POST request must have a body');

    const selectColumns = rawSql(requestToColumnList(req));

    const fieldsQuoted = rawSql('(' + Object.keys(req.body)
        .map(pgEscape.ident).join(', ') + ')');

    const valuesQuoted = sql `(${joinSql(
        Object.keys(req.body)
        .map(key => prepareSqlValue(req.body[key]))
    )})`;

    const returning =  req.flags.preferRepresentation !== 'headersOnly'
        ? rawSql ` RETURNING ${selectColumns}`
        : rawSql ``;

    const bodyExpression = req.flags.preferSingular ? sql `
        coalesce(string_agg(row_to_json(t)::text, ','), '')::character varying
    ` : sql `
        coalesce(array_to_json(array_agg(row_to_json(t))), '[]')::character varying
    `;

    const insertSubquery = Object.keys(req.body).length ?
        sql `INSERT INTO ${qualifiedRelationQuoted} ${fieldsQuoted}
            VALUES ${valuesQuoted}
            ${returning}`
        : sql `INSERT INTO ${qualifiedRelationQuoted}
            DEFAULT VALUES
            ${returning}`;

    return req.flags.preferRepresentation !== 'full' ?
        insertSubquery
        : sql `
            WITH t AS (${insertSubquery})
            SELECT ${bodyExpression} as body from t
        `;
}
