export function isEveryFalsy(...args) {
    return args.every(v => !Boolean(v));
}
