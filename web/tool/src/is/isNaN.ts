export function isNaN(v) {
    if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN('a')) {
        return Number.isNaN(v);
    }

    return v !== v;
}
