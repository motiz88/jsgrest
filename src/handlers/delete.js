import wrap from '../wrap';
import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';

export default wrap(async function deleteHandler(req, res) {
    const qualifiedRelationQuoted = requestToQualifiedRelationQuoted(req);
    const whereClause = requestToWhereClause(req);
    await res.execQuery(`DELETE FROM ${qualifiedRelationQuoted} ${whereClause}`);
    res.sendStatus(204);
    // FIXME: return number of affected rows or 404 if none
});
