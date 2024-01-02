import {isObject} from './is';

export function looseEqual(a, b) {
    if (a === b) {
        return true;
    }

    let isObjectA = isObject(a);
    let isObjectB = isObject(b);

    if (isObjectA && isObjectB) {
        try {
            let isArrayA = Array.isArray(a);
            let isArrayB = Array.isArray(b);

            if (isArrayA && isArrayB) {
                return (
                    a.length === b.length &&
                    a.every(function (e, i) {
                        return looseEqual(e, b[i]);
                    })
                );
            } else if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime();
            } else if (!isArrayA && !isArrayB) {
                let keysA = Object.keys(a);
                let keysB = Object.keys(b);

                return (
                    keysA.length === keysB.length &&
                    keysA.every(function (key) {
                        return looseEqual(a[key], b[key]);
                    })
                );
            }
            return false;
        } catch (e) {
            return false;
        }
    } else if (!isObjectA && !isObjectB) {
        return String(a) === String(b);
    } else {
        return false;
    }
}
