import url from 'url';

export function coerceRegex(regex) {
    return value => {
        const matches = regex.exec(value);
        if (!matches)
            throw new Error(`Invalid value '${value}'`);
        return matches[1] || matches[0];
    };
}

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
    if (format instanceof RegExp)
        func = coerceRegex(format);
    else if (typeof format === 'string') {
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
