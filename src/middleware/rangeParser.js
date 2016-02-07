import parseUnitAndRange from '../parseUnitAndRange';

export default function rangeParser(req, res, next) {
    req.range = parseUnitAndRange(req.header('Range-Unit'), req.header('Range'));
    if (req.range.first > req.range.last)
        res.sendStatus(416);
    else {
        if (req.flags && req.flags.preferSingular)
            req.range.last = req.range.first;
        next();
    }
}
