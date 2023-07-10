export function isURLSearchParams(v) {
    return (
        typeof URLSearchParams !== 'undefined' && v instanceof URLSearchParams
    );
}
