import wrap from '../wrap';
import requestToReadStatement from '../query/requestToReadStatement';

export default wrap(async function selectHandler(req, res, next) {
    let statement;
    try {
        statement = requestToReadStatement(req);
    }
    catch(e) {
        return res.sendStatus(400);
    }
    await res.status(200).sendSelectQuery(...statement);
    next();
});
