/**
 * Check if a string starts with $ or _
 */
export function isReserved(str) {
    let c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5f;
}
