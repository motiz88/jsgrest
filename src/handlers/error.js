import errorToHttpStatus from '../errorToHttpStatus';

export default function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    const status = errorToHttpStatus(err);
    res.status(status || 500);
}
