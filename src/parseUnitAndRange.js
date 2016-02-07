import XRegExp from 'xregexp';

const rangeRegex = XRegExp(`
    ^
    (?<first> \\d+)
    -
    (?<last> \\d*)
    $
`, 'x');

export default function parseUnitAndRange(unit, range) {
    const match = XRegExp.exec(range, rangeRegex);
    if (match)
        return {
            unit: unit || '',
            first: parseInt(match.first),
            last: match.last ? parseInt(match.last) : Infinity
        };
    else
        return {
            unit: unit || 'items',
            first: 0,
            last: Infinity
        };
}
