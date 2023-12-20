import {toString} from './constant';
const hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

export function isPromise(v) {
    if (!hasToStringTag) {
        return toString.call(v) === '[object Promise]';
    }

    return !!v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';
}
