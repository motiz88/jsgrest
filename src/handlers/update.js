import wrap from '../wrap';
import requestToUpdateStatement from '../query/requestToUpdateStatement';

export default wrap(async function updateHandler(req, res, next) {
    let statement;
    try {
        statement = requestToUpdateStatement(req);
    }
    catch(e) {
        return res.status(400).send(e.stack || e.message || e.code || e);
    }
    res.dbUpdateResult = await res.execQuery(statement);
    next();
});
