import pgEscape from 'pg-escape';
import {parse as parseContentRange} from 'content-range';

export default function requestToOffsetLimitClause(req) {
    if (String(req.header('Range-Unit')).toLowerCase() === 'items') {
        const range = parseContentRange(req.header('Range-Unit') + ' ' + req.header('Range'));
        const offsetClause = range.first !== null ?
            ('OFFSET ' + pgEscape.literal(range.first)) : '';
        const limitClause = (range.last >= range.first) ?
            ('LIMIT ' + pgEscape.literal(range.last - range.first + 1)) : '';
        return `${offsetClause} ${limitClause}`;
    }
    else
        return '';
}
