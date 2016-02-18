import wrap from '../wrap';
import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';
import sql, {raw as rawSql} from '../sqlTemplate';

export default wrap(async function deleteHandler(req, res, next) {
    const qualifiedRelationQuoted = rawSql(requestToQualifiedRelationQuoted(req));
    const whereClause = requestToWhereClause(req);
    res.dbDeleteResult = await res.execQuery(
        sql `DELETE FROM ${qualifiedRelationQuoted} ${whereClause}`
    );
    next();
});
