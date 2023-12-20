import {toString} from './constant';

export function isBlob(v): boolean {
    return toString.call(v) === '[object Blob]';
}
