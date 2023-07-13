import {isFunction, isPlainObject, isArray} from './is';

function merge(
    deep: boolean,
    source: Record<string, any>,
    target: Record<string, any>
): Record<string, any>;
function merge() {
    var clone;
    var options;
    var name;
    var copy;
    var deep = false;

    var src;

    var copyIsArray;

    var target = arguments[0] || {};

    var i = 1;

    var length = arguments.length;

    if (typeof target === 'boolean') {
        deep = target;

        target = arguments[i] || {};

        i++;
    }

    if (typeof target !== 'object' && !isFunction(target)) {
        target = {};
    }

    for (; i < length; i++) {
        if ((options = arguments[i]) != null) {
            for (name in options) {
                copy = options[name];

                if (name === '__proto__' || target === copy) {
                    continue;
                }

                if (
                    deep &&
                    copy &&
                    (isPlainObject(copy) || (copyIsArray = isArray(copy)))
                ) {
                    src = target[name];

                    if (copyIsArray && isArray(src)) {
                        clone = [];
                    } else if (!copyIsArray && !isPlainObject(src)) {
                        clone = {};
                    } else {
                        clone = src;
                    }

                    copyIsArray = false;

                    target[name] = merge(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
}

export function assign(
    source: Record<string, any>,
    target: Record<string, any>
) {
    return merge(false, source, target);
}

export function deepmerge<T extends Record<string, any>>(
    source: Record<string, any>,
    target: Record<string, any>
): T {
    return merge(true, source, target) as T;
}

export function clone(target: Record<string, any>): Record<string, any> {
    return merge(true, {}, target);
}
