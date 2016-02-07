export default function requestToOffsetLimit(req) {
    if (req.range && req.range.unit === 'items') {
        const offset = typeof req.range.first === 'number' ? req.range.first : undefined;
        const limit = typeof req.range.first === 'number' && req.range.last >= req.range.first ?
            req.range.last - req.range.first + 1 : undefined;

        return {offset, limit: isFinite(limit) ? limit : undefined};
    } else
        return {};
}
