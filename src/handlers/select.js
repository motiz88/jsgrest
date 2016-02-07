import wrap from '../wrap';
import requestToReadStatement from '../query/requestToReadStatement';

export default wrap(async function selectHandler(req, res, next) {
    await res.status(200).sendSelectQuery(...requestToReadStatement(req));
    next();
});
