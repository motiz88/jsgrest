import XRegExp from 'xregexp';
import sql, {join as joinSql, raw as rawSql} from '../sqlTemplate';
import fieldPathToSql from '../fieldPathToSql';
import arrayLiteralToSql from '../arrayLiteralToSql';

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

function likePatternToSql(rhs) {
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
            let sqlOp = operatorMap[match.operator || ''];
            if (!sqlOp)
                throw new Error('No such operator: ' + match.operator);
            sqlOp = rawSql(sqlOp);
            let sqlRhs;
            switch (match.operator) {
                case 'is': /* falls through */
                case 'isnot':
                    if (rhsForIsOpRegex.exec(match.rhs))
                        sqlRhs = rawSql(match.rhs.toUpperCase());
                    else
                        sqlRhs = sql `${match.rhs}`;
                    break;
                case 'in': /* falls through */
                case 'notin':
                    sqlRhs = sql `(${joinSql(match.rhs.split(','))})`;
                    break;
                case '@@':
                    sqlRhs = sql `to_tsquery(${match.rhs})`;
                    break;
                case 'like': /* falls through */
                case 'ilike':
                    sqlRhs = sql `${likePatternToSql(match.rhs)}`;
                    break;
                case '@>': /* falls through */
                case '<@':
                    sqlRhs = sql `${arrayLiteralToSql(match.rhs)}`;
                    break;
                default:
                    sqlRhs = sql `${match.rhs}`;
                    break;

            }
            const keyQuoted = rawSql(fieldPathToSql(key));
            const sqlExpr = sql `${keyQuoted} ${sqlOp} ${sqlRhs}`;
            if (match.not)
                return sql`NOT (${sqlExpr})`;
            return sqlExpr;
        })
        .filter(Boolean);
    if (!whereConditions.length)
        return sql``;
    else
        return sql`WHERE ${joinSql(whereConditions, ' AND ')}`;
}
