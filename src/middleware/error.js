import errorToHttpStatus from '../errorToHttpStatus';
import normalizeError from '../normalizeError';

export default function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    err = normalizeError(err);
    const status = errorToHttpStatus(err);
    if (!status || status === 500)
        return next(err);
    res.status(status || 500)
        .json(err);
}
