import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';
import sql, {raw as rawSql} from '../sqlTemplate';

export default function requestToDeleteStatement(req) {
    const qualifiedRelationQuoted = rawSql(requestToQualifiedRelationQuoted(req));
    const whereClause = requestToWhereClause(req);
    return sql `DELETE FROM ${qualifiedRelationQuoted} ${whereClause}`;
}