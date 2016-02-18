export default function formatContentRange(range) {
    const length = typeof range.length !== 'number' ? '*' : range.length;

    const first = range.first;
    const last = range.last;

    if (last - first < 0) return '*/' + length;

    return first + '-' + last + '/' + length;
}
