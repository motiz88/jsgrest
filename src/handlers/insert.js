import wrap from '../wrap';
import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import pgEscape from 'pg-escape';

export default wrap(async function insertHandler(req, res) {
    const qualifiedRelationQuoted = requestToQualifiedRelationQuoted(req);
    if (!req.body)
        return res.sendStatus(400);

    const fieldsQuoted = '(' + Object.keys(req.body)
        .map(pgEscape.ident).join(', ') + ')';
    const valuesQuoted = '(' + Object.keys(req.body)
        .map(key => req.body[key])
        .map(pgEscape.literal)
        .join(', ') + ')';
    // FIXME: pgEscape.literal is a bad choice here. Doesn't handle numbers and many other cases.

    const returning = req.header('Prefer')==='return=representation' ? ' RETURNING *' : '';
    const query = `INSERT INTO ${qualifiedRelationQuoted} ${fieldsQuoted} VALUES ${valuesQuoted}
        ${returning}`;

    const dbResult = await res.execQuery(query);
    res.status(201).json(dbResult.rows);
});
