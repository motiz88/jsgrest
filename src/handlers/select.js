import wrap from '../wrap';
import requestToReadStatement from '../query/requestToReadStatement';

export default wrap(async function selectHandler(req, res, next) {
    let statement;
    try {
        statement = requestToReadStatement(req);
    }
    catch(e) {
        return res.status(400).send(e.stack || e.message || e.code || e);
    }
    await res.status(200).sendSelectQuery(statement);
    next();
});
