import wrap from '../wrap';
import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';
import pgEscape from 'pg-escape';
import sql, {join as joinSql, raw as rawSql} from '../sqlTemplate';

export default wrap(async function updateHandler(req, res) {
    const qualifiedRelationQuoted = rawSql(requestToQualifiedRelationQuoted(req));
    if (!req.body)
        return res.sendStatus(400);

    const assignmentsQuoted = joinSql(Object.keys(req.body)
        .map(key => sql `${rawSql(pgEscape.ident(key))} = ${req.body[key]}`)
    );
    if (!assignmentsQuoted.text.length)
        return res.sendStatus(400);

    const whereClause = requestToWhereClause(req);
    const returning = rawSql(
        req.flags.preferRepresentation !== 'headersOnly' ? ' RETURNING *' : ''
    );
    const query = sql
        `UPDATE ${qualifiedRelationQuoted} SET ${assignmentsQuoted} ${whereClause} ${returning}`;

    const dbResult = await res.execQuery(query);
    const status = req.flags.preferRepresentation !== 'headersOnly' ? 200 : 204;
    res.status(status).json(dbResult.rows);
});
