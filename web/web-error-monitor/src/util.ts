import {hasOwn, isFunction, toArray} from 'yma-tool';

export function stub(obj, name, replacement) {
    if (obj == null) {
        return;
    }

    let rawFn = obj[name];
    obj[name] = replacement(rawFn, name);
    obj[name].__stub__ = true;
    obj[name].__raw__ = rawFn;
}

interface WrapOptions {
    deep?: boolean;
    before?: (...args: any[]) => void;

    [key: string]: any;
}

export function wrap(
    func,
    options: WrapOptions = {
        deep: false,
        before: function () {},
    },
) {
    const {deep, before} = options;

    if (!isFunction(func)) {
        return func;
    }

    try {
        if (func.__is__) {
            return func;
        }

        if (func.__wrapper__) {
            return func.__wrapper__;
        }
    } catch (e) {
        return func;
    }

    function wrapper(this) {
        let args: any[] = [];
        let i = arguments.length;

        if (before && isFunction(before)) {
            before.apply(this, toArray(arguments));
        }

        while (i--) {
            args[i] = deep ? wrap(arguments[i], options) : arguments[i];
        }

        try {
            return func.apply(this, args);
        } catch (e) {
            captureException(e as Error, options);

            throw e;
        }
    }

    for (const prop in func) {
        if (hasOwn(func, prop)) {
            wrapper[prop] = func[prop];
        }
    }

    wrapper.prototype = func.prototype;
    func.__wrapper__ = wrapper;
    wrapper.__is__ = true;
    wrapper.__raw__ = func;

    return wrapper;
}
