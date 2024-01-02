import {toString} from './constant';

const fnToStr = Function.prototype.toString;
const re = /^\s*(?:function)?\*/;
const hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
const getProto = Object.getPrototypeOf;

let getGeneratorFunc = function () {
    if (!hasToStringTag) {
        return false;
    }

    try {
        return Function('return function*() {}')();
    } catch (e) {}
};

let GeneratorFunction;
export function isGeneratorFunction(fn) {
    if (typeof fn !== 'function') {
        return false;
    }

    if (re.test(fnToStr.call(fn))) {
        return true;
    }

    if (!hasToStringTag) {
        let str = toString.call(fn);
        return str === '[object GeneratorFunction]';
    }

    if (!getProto) {
        return false;
    }

    if (typeof GeneratorFunction === 'undefined') {
        let generatorFunc = getGeneratorFunc();
        GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
    }

    return getProto(fn) === GeneratorFunction;
}
