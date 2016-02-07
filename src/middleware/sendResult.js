import formatContentRange from '../formatContentRange';

function rangeStatus({first, last, length}, singular) {
    if (length !== null && first > length)
        return 416;
    else if (!singular && length !== null && 1 + last - first < length)
        return 206;
    return 200;
}

export default function sendResult(req, res, next) {
    if (res.dbReadResult && res.dbReadResult.rows && res.dbReadResult.rows.length) {
        const row = res.dbReadResult.rows[0];

        const body = row.body || '',
            tableTotal = row.total_result_set,
            queryTotal = row.page_total;

        const first = req.range ? req.range.first : 0;

        const range = {
            first,
            last: first + parseInt(queryTotal) - 1,
            length: req.flags.preferCount ? parseInt(tableTotal) : null
        };

        const rangeFormatted = formatContentRange(range);


        res.set('Content-Range', rangeFormatted);
        res.set('Range-Unit', 'items');
        res.status(rangeStatus(range, req.flags.preferSingular));

        if (req.flags.preferSingular && queryTotal <= 0)
            res.sendStatus(404);
        else {
            res.set('Content-Type', 'application/json');
            res.send(body);
        }
    } else
        next();
}
