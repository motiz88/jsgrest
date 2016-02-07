export default function formatContentRange(range) {
    // if (!range || typeof range !== 'object')
    //     throw new TypeError('Invalid range object');
    // if (!('first' in range) || typeof range.first !== 'number')
    //     throw new TypeError('Missing or invalid range.first');
    // if (!('last' in range) || typeof range.last !== 'number')
    //     throw new TypeError('Missing or invalid range.last');
    const length = typeof range.length !== 'number' ? '*' : range.length;

    const first = range.first;
    const last = range.last;

    if (last - first < 0) return '*/' + length;

    return first + '-' + last + '/' + length;
}
