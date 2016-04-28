import wrap from '../wrap';
import requestToInvokeStatement from '../query/requestToInvokeStatement';

export default wrap(async function InvokeHandler(req, res, next) {
    if (req.action !== 'invoke')
        return res.sendStatus(405);
    let statement;
    try {
        statement = requestToInvokeStatement(req);
    }
    catch(e) {
        return res.status(400).send(e.stack || e.message || e.code || e);
    }
    res.dbInvokeResult = await res.execQuery(statement);
    next();
});
