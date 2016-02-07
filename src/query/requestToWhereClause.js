import pgEscape from 'pg-escape';
import XRegExp from 'xregexp';

const conditionRegex = XRegExp(`
    ^ # start of value
    (?<not> not \\.)?
    (?<operator>  n?eq|gte?|lte?|i?like|@@|isnot|is|in|<@|@>|notin )
    \\.
    (?<rhs> .*)
    $
`, 'x');

const rhsForIsOpRegex = XRegExp(`
    ^ TRUE | FALSE | NULL $
`, 'xi');

const operatorMap = {
    eq: '=',
    neq: '<>',
    gt: '>',
    lt: '<',
    gte: '>=',
    lte: '<=',
    '<@': '<@',
    '@>': '@>',
    is: 'IS',
    isnot: 'IS NOT',
    in : 'IN',
    notin: 'NOT IN',
    '@@': '@@',
    like: 'LIKE',
    ilike: 'ILIKE'
};

function convertLikePattern(rhs) {
    return String(rhs || '').replace(/\*/g, '%');
}

export default function requestToWhereClause(req) {
    const whereConditions = Object.keys(req.query || {})
        .filter(key => key !== 'order')
        .map(key => {
            const condition = req.query[key];
            const match = XRegExp.exec(condition, conditionRegex);
            if (!match)
                throw new Error(`Unrecognized query condition ${key}=${condition}`);
            const sqlOp = operatorMap[match.operator || ''];
            if (!sqlOp)
                throw new Error('No such operator: ' + match.operator);
            let sqlRhsQuoted;
            switch (match.operator) {
                case 'is': /* falls through */
                case 'isnot':
                    if (rhsForIsOpRegex.exec(match.rhs))
                        sqlRhsQuoted = match.rhs.toUpperCase();
                    else
                        sqlRhsQuoted = pgEscape.literal(match.rhs);
                    break;
                case 'in': /* falls through */
                case 'notin':
                    sqlRhsQuoted = '(' + match.rhs.split(',').map(pgEscape.literal).join(',') + ')';
                    break;
                case '@@':
                    sqlRhsQuoted = `to_tsquery(${pgEscape.literal(match.rhs)})`;
                    break;
                case 'like': /* falls through */
                case 'ilike':
                    sqlRhsQuoted = pgEscape.literal(convertLikePattern(match.rhs));
                    break;
                default:
                    sqlRhsQuoted = pgEscape.literal(match.rhs);
                    break;

            }
            const keyQuoted = pgEscape.ident(key);
            const sqlExpr = `${keyQuoted} ${sqlOp} ${sqlRhsQuoted}`;
            if (match.not)
                return `NOT (${sqlExpr})`;
            return sqlExpr;
        })
        .filter(Boolean)
        .join(' AND ');
    return whereConditions ? ('WHERE ' + whereConditions) : '';
}
