export function isErrorEvent(value) {
    return Object.prototype.toString.call(value) === '[object ErrorEvent]';
}
