import pgEscape from 'pg-escape';
import XRegExp from 'xregexp';

const specRegex = XRegExp(`
    ^
    (?<column> .+?)
    (?<direction> \.desc | \.asc )?
    (?<nulls> \.nullsfirst | \.nullslast )?
    $
`, 'x');

export default function requestToOrderClause(req) {
    const orderSpecs = ((req.query || {}).order || '').split(',')
        .filter(Boolean)
        .map(spec => {
            const match = XRegExp.exec(spec, specRegex);
            /* istanbul ignore if: specRegex is pretty much 100% permissive here */
            if (!match)
                throw new Error(`Unrecognized order spec ${spec}`);
            const columnQuoted = pgEscape.ident(match.column);
            const direction = match.direction === '.desc' ? 'DESC' : 'ASC';
            const nulls = match.nulls === '.nullsfirst' ? 'NULLS FIRST' :
                (match.nulls === '.nullslast' ? 'NULLS LAST' : '');
            const sqlExpr = `${columnQuoted} ${direction} ${nulls}`;

            return sqlExpr;
        })
        .filter(Boolean)
        .map(s => s.trim())
        .join(', ');
    return (orderSpecs ? ('ORDER BY ' + orderSpecs) : '').trim();
}
