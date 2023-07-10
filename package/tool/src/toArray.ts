export function toArray(value: {[Symbol.iterator](): IterableIterator<any>}) {
    return Array.prototype.slice.call(value);
}
