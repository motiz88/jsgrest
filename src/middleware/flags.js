const representations = {
    'return=representation': 'full',
    'return=minimal': 'none'
};

export default function flags(req, res, next) {
    const prefer = req.get('Prefer') || '';
    req.flags = {
        preferSingular: prefer === 'plurality=singular',
        preferCount: prefer !== 'count=none',
        preferRepresentation: representations[prefer] || 'headersOnly',
    };
    next();
}
