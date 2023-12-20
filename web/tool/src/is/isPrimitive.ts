export function isPrimitive(v) {
    const type = typeof v;

    return ['string', 'number', 'symbol', 'boolean'].includes(type);
}
