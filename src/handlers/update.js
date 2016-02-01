import wrap from '../wrap';
import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';
import pgEscape from 'pg-escape';

export default wrap(async function updateHandler(req, res, next) {
    const qualifiedRelationQuoted = requestToQualifiedRelationQuoted(req);
    if (!req.body)
        return res.sendStatus(400);

    const assignmentsQuoted = Object.keys(req.body)
        .map(key => pgEscape.ident(key) + ' = ' + pgEscape.literal(req.body[key]))
        .join(', ');
    if (!assignmentsQuoted)
        return res.sendStatus(400);

    // FIXME: pgEscape.literal is a bad choice here. Doesn't handle numbers and many other cases.

    const whereClause = requestToWhereClause(req);
    const returning = req.header('Prefer')==='return=representation' ? ' RETURNING *' : '';
    const query =
        `UPDATE ${qualifiedRelationQuoted} SET ${assignmentsQuoted} ${whereClause} ${returning}`;

    const dbResult = await res.execQuery(query);
    res.status(201).json(dbResult.rows);
});
