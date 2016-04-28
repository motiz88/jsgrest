export default function actions(req, res, next) {
    if (/\/rpc\//.test(req.path) && req.method === 'POST')
        req.action = 'invoke';
    next();
}
