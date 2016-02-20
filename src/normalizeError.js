export default function normalizeError(error) {
    if (!error || typeof error !== 'object')
        return error;
    const {
        code,
        message,
        sqlState,
        messagePrimary,
        ...otherFields
    } = error;
    return {
        code: code || sqlState,
        message: message || messagePrimary,
        details: otherFields
    };
}
