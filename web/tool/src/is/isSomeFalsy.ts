export function isSomeFalsy(...args) {
    return args.some(v => !v);
}
