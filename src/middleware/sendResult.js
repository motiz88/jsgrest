import formatContentRange from '../formatContentRange';

function rangeReadStatus({first, last, length}, singular) {
    if (length !== null && first > length)
        return 416;
    else if (!singular && length !== null && 1 + last - first < length)
        return 206;
    return 200;
}

function rangeDeleteStatus({length}) {
    if (!length)
        return 404;
    return 204;
}

export default function sendResult(req, res, next) {
    if (res.dbReadResult && res.dbReadResult.rows && res.dbReadResult.rows.length) {
        const result = res.dbReadResult;
        const row = result.rows[0];

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
        res.status(rangeReadStatus(range, req.flags.preferSingular));

        if (req.flags.preferSingular && queryTotal <= 0)
            res.sendStatus(404);
        else {
            res.set('Content-Type', 'application/json');
            res.send(body);
        }
    } else if (res.dbDeleteResult) {
        const result = res.dbDeleteResult;
        const range = {
            first: 1,
            last: 0,
            length: result.rowCount
        };

        const rangeFormatted = formatContentRange(range);
        res.set('Content-Range', rangeFormatted);
        res.set('Range-Unit', 'items');
        res.status(rangeDeleteStatus(range));

        console.log(result);
        res.send();
    } else if (res.dbInsertResult) {
        const result = res.dbInsertResult;

        res.status(201);
        if (req.flags.preferRepresentation !== 'full')
            res.send();
        else {
            const row = result.rows[0];
            const body = row.body;
            res.set('Content-Type', 'application/json');
            res.send(body);
        }
    } else if (res.dbUpdateResult) {
        const result = res.dbUpdateResult;
        const range = {
            first: 1,
            last: result.rowCount,
            length: result.rowCount
        };
        const rangeFormatted = formatContentRange(range);
        res.set('Content-Range', rangeFormatted);
        res.set('Range-Unit', 'items');

        if (result.rowCount === 0)
            res.sendStatus(404);
        else if (req.flags.preferRepresentation !== 'full')
            res.sendStatus(204);
        else {
            const row = result.rows[0];
            const body = row.body;
            res.set('Content-Type', 'application/json');
            res.send(body);
        }
    }
    else
        next();
}
