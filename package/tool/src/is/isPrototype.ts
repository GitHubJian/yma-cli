export function isPrototype(v) {
    const objectProto = Object.prototype;
    const Ctor = v && v.constructor;
    const proto = (typeof Ctor === 'function' && Ctor.prototype) || objectProto;

    return v === proto;
}
