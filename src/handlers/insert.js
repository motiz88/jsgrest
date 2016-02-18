import wrap from '../wrap';
import requestToCreateStatement from '../query/requestToCreateStatement';

export default wrap(async function insertHandler(req, res, next) {
    let statement;
    try {
        statement = requestToCreateStatement(req);
    }
    catch(e) {
        return res.status(400).send(e.stack || e.message || e.code || e);
    }
    res.insertDbResult = await res.execQuery(statement);
    next();
});
