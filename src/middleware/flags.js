const representations = {
    'return=representation': 'full',
    'return=minimal': 'none'
};

export default function flags(req, res, next) {
    const prefer = req.get('Prefer') || '';
    req.flags = {
        preferSingular: prefer === 'plurality=singular'
            || (req.action !== 'invoke' && req.method === 'POST' && !Array.isArray(req.body)),
        preferCount: prefer !== 'count=none',
        preferRepresentation: representations[prefer] || 'headersOnly',
    };
    next();
}
