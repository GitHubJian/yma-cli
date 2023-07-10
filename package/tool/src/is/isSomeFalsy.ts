export function isSomeFalsy(...args) {
    return args.some(v => !Boolean(v));
}
