import url from 'url';

export function coerceUrl() {
    return value => {
        const {protocol} = url.parse(value);
        if (!protocol)
            throw new Error(`Invalid url '${value}'`);
        return value;
    };
}

export default function coerce(format, displayName) {
    let func;
    if (typeof format === 'string') {
        displayName = displayName || format;
        switch (format.toLowerCase()) {
            case 'url':
                func = coerceUrl();
        }
    }
    if (func && displayName)
        func.displayName = displayName;
    return func;
}
