export default function prepareSqlValue(val) {
    if (Array.isArray(val))
        return JSON.stringify(val);
    else
        return val;
}
