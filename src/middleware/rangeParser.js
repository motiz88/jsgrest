import parseUnitAndRange from '../parseUnitAndRange';

export default function rangeParser(req, res, next) {
    req.range = parseUnitAndRange(req.header('Range-Unit'), req.header('Range'));
    next();
}
