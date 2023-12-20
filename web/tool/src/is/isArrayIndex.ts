import {MAX_SAFE_INTEGER} from './constant';

export function isArrayIndex(value, length: number = MAX_SAFE_INTEGER) {
    const re = /^(?:0|[1-9]\d*)$/;
    const type = typeof value;

    return (
        !!length &&
        (type === 'number' || (type !== 'symbol' && re.test(value))) &&
        value > -1 &&
        value % 1 == 0 &&
        value < length
    );
}
