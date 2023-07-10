export function isObject(v) {
    let type = typeof v;

    return v !== null && (type == 'object' || type == 'function');
}
