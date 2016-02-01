import wrap from '../wrap';
import requestToQualifiedRelationQuoted from '../query/requestToQualifiedRelationQuoted';
import requestToWhereClause from '../query/requestToWhereClause';
import requestToOrderClause from '../query/requestToOrderClause';
import requestToOffsetLimitClause from '../query/requestToOffsetLimitClause';

export default wrap(async function selectHandler(req, res) {
    const qualifiedRelationQuoted = requestToQualifiedRelationQuoted(req);
    const whereClause = requestToWhereClause(req);
    const orderClause = requestToOrderClause(req);
    const offsetLimitClause = requestToOffsetLimitClause(req);
    const query = `SELECT * FROM ${qualifiedRelationQuoted} ${whereClause} ${orderClause}
            ${offsetLimitClause}`;

    await res.status(200).sendSelectQuery(query);
});
