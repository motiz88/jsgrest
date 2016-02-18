class Fragment {
    constructor(strings, ...values) {
        this.parts = [];
        if (strings.length)
            this.parts.push(strings[0]);
        for (let i = 0; i < values.length; ++i) {
            if (isFragment(values[i]) || isValueReference(values[i]))
                this.parts.push(values[i]);
            else
                this.parts.push(new ValueReference(values[i]));
            this.parts.push(strings[i + 1]);
        }
        this._isFlat = false;
        this.flatten();
    }

    static raw(...parts) {
        const self = new Fragment([]);
        self.parts = parts;
        self._isFlat = false;
        self.flatten();
        return self;
    }

    toString(paramIndex) {
        if (typeof paramIndex !== 'number')
            paramIndex = 0;
        let result = '';
        for (let i = 0; i < this.parts.length; ++i) {
            const part = this.parts[i];
            if (isFragment(part))
                result += part.toString(paramIndex);
            else if (isValueReference(part))
                result += `$${++paramIndex}`;
            else
                result += part;
        }
        return result;
    }

    get values() {
        let result = [];
        for (let i = 0; i < this.parts.length; ++i) {
            const part = this.parts[i];
            if (isFragment(part))
                result.push(...part.values);
            else if (isValueReference(part))
                result.push(part.value);
        }
        return result;
    }

    get text() {
        return this.toString();
    }

    flatten() {
        if (this._isFlat)
            return this;
        const newParts = [];
        for (let i = 0; i < this.parts.length; ++i) {
            const part = this.parts[i];
            if (isFragment(part))
                newParts.push(...part.flatten().parts);
            else
                newParts.push(part);
        }
        this.parts = newParts;
        this._isFlat = true;
        return this;
    }
}

class ValueReference {
    constructor(value) {
        this.value = value;
    }
}

export default function sqlFragment(strings, ...values) {
    return new Fragment(strings, ...values);
}

export function isFragment(x) {
    return x instanceof Fragment;
}

export function join(arr, s) {
    if (typeof s !== 'string')
        s = ',';
    if (!Array.isArray(arr))
        return arr;
    const filler = Array(arr.length+1).fill(s);
    filler[0] = '';
    filler[filler.length-1] = '';
    return new Fragment(filler, ...arr);
}

export function raw(strings, ...values) {
    if (Array.isArray(strings)) {
        const parts = [];
        if (strings.length)
            parts.push(strings[0]);
        for (let i = 0; i < values.length; ++i) {
            parts.push(values[i]);
            parts.push(strings[i + 1]);
        }
        return Fragment.raw(...parts);
    }
    return Fragment.raw(strings);
}

function isValueReference(x) {
    return x instanceof ValueReference;
}
