import {toString} from './constant';

export function isSymbol(v) {
    const type = typeof v;
    return type === 'symbol' || (type === 'object' && v != null && toString.call(v) === '[object Symbol]');
}
