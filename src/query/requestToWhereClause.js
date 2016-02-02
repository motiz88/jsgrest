import pgEscape from 'pg-escape';
import XRegExp from 'xregexp';

const conditionRegex = XRegExp(`
    ^ # start of value
    (?<not> not \.)?
    (?<operator>  n?eq|gte?|lte?|i?like|@@|isnot|is|in|<@|@>|notin )
    \.
    (?<rhs> .*)
    $
`, 'x');

const rhsForIsOpRegex = XRegExp(`
    ^ TRUE | FALSE | NULL $
`, 'xi');

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
            let sqlOp, sqlRhsQuoted = pgEscape.literal(match.rhs);
            switch (match.operator) {
                case 'eq':
                    sqlOp = '=';
                    break;
                case 'neq':
                    sqlOp = '<>';
                    break;
                case 'gt':
                    sqlOp = '>';
                    break;
                case 'lt':
                    sqlOp = '<';
                    break;
                case 'gte':
                    sqlOp = '>=';
                    break;
                case 'lte':
                    sqlOp = '<=';
                    break;
                case '<@':
                    sqlOp = '<@';
                    break;
                case '@>':
                    sqlOp = '@>';
                    break;
                case 'is':
                    sqlOp = 'IS';
                    if (rhsForIsOpRegex.exec(match.rhs))
                        sqlRhsQuoted = match.rhs.toUpperCase();
                    break;
                case 'isnot':
                    sqlOp = 'IS NOT';
                    if (rhsForIsOpRegex.exec(match.rhs))
                        sqlRhsQuoted = match.rhs.toUpperCase();
                    break;
                case 'in':
                    sqlOp = 'IN';
                    break;
                case 'notin':
                    sqlOp = 'NOT IN';
                    break;
                case '@@':
                    sqlOp = '@@';
                    sqlRhsQuoted = `to_tsquery(${sqlRhsQuoted})`;
                    break;
                case 'like':
                    sqlOp = 'LIKE';
                    sqlRhsQuoted = pgEscape.literal(convertLikePattern(match.rhs));
                    break;
                case 'ilike':
                    sqlOp = 'ILIKE';
                    sqlRhsQuoted = pgEscape.literal(convertLikePattern(match.rhs));
                    break;
                default:
                    throw new Error('No such operator: ' + match.operator);
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
