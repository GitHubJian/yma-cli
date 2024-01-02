const frozenPropertyCacheMap = new WeakMap();

function isPropertyFrozen(target, prop) {
    if (!target || !prop) {
        return false;
    }

    const targetPropertiesFromCache = frozenPropertyCacheMap.get(target) || {};

    if (targetPropertiesFromCache[prop]) {
        return targetPropertiesFromCache[prop];
    }

    const propertyDescriptor = Object.getOwnPropertyDescriptor(target, prop);
    const frozen = Boolean(
        propertyDescriptor &&
            propertyDescriptor.configurable === false &&
            (propertyDescriptor.writable === false || (propertyDescriptor.get && !propertyDescriptor.set)),
    );

    targetPropertiesFromCache[prop] = frozen;
    frozenPropertyCacheMap.set(target, targetPropertiesFromCache);

    return frozen;
}

function getTargetValue(target, value) {
    return value;
}

function createFakeGlobal(globalContext, speedy) {
    const propertiesWithGetter = new Map();
    const fakeGlobal = {};

    Object.getOwnPropertyNames(globalContext)
        .filter(prop => {
            const descriptor = Object.getOwnPropertyDescriptor(globalContext, prop);
            return !(descriptor && descriptor.configurable);
        })
        .forEach(prop => {
            const descriptor = Object.getOwnPropertyDescriptor(globalContext, prop);

            if (descriptor) {
                const hasGetter = Object.prototype.hasOwnProperty.call(descriptor, 'get');

                if (
                    prop === 'top' ||
                    prop === 'parent' ||
                    prop === 'self' ||
                    prop === 'window' ||
                    (prop === 'document' && speedy)
                ) {
                    descriptor.configurable = true;

                    if (!hasGetter) {
                        descriptor.writable = true;
                    }
                }

                if (hasGetter) {
                    propertiesWithGetter.set(prop, true);
                }

                Object.defineProperty(fakeGlobal, prop, Object.freeze(descriptor));
            }
        });

    return {
        fakeGlobal,
        propertiesWithGetter,
    };
}

let activeSandboxCount = 0;
class ProxySandbox {
    name: string;
    globalContext: any;
    sandboxRunning: boolean;
    updatedValueSet: Set<string>;
    globalWhitelistPrevDescriptor: string[];

    constructor(
        name,
        globalContext,
        options: {
            speedy?: boolean;
            globalVariableWhiteList?: string[];
            useNativeWindowForBindingsProps?: Map<string, any>;
        } = {},
    ) {
        this.name = name;
        this.globalContext = globalContext;
        this.sandboxRunning = false;
        this.globalWhitelistPrevDescriptor = [];
        const updatedValueSet = (this.updatedValueSet = new Set());

        const speedy = options.speedy || false;
        const globalVariableWhiteList = options.globalVariableWhiteList || [];
        const useNativeWindowForBindingsProps = options.useNativeWindowForBindingsProps || new Map();

        const {fakeGlobal, propertiesWithGetter} = createFakeGlobal(globalContext, !!speedy);
        const descriptorTargetMap = new Map();

        const proxy = new Proxy(fakeGlobal, {
            set: (target, prop, value) => {
                if (this.sandboxRunning) {
                    if (typeof prop === 'string' && globalVariableWhiteList.includes(prop)) {
                        this.globalWhitelistPrevDescriptor[prop] = Object.getOwnPropertyDescriptor(globalContext, prop);
                        globalContext[prop] = value;
                    } else {
                        if (!target.hasOwnProperty(prop) && globalContext.hasOwnProperty(prop)) {
                            const descriptor = Object.getOwnPropertyDescriptor(globalContext, prop);
                            const {writable, configurable, enumerable, set} = descriptor;

                            if (writable || set) {
                                Object.defineProperty(target, prop, {
                                    configurable,
                                    enumerable,
                                    writable: true,
                                    value,
                                });
                            }
                        } else {
                            target[prop] = value;
                        }
                    }

                    updatedValueSet.add(prop);

                    this.latestSetProp = prop;

                    return true;
                }

                return true;
            },
            get: (target, prop) => {
                if (prop === 'window' || prop === 'self') {
                    return proxy;
                }

                if (prop === 'globalThis') {
                    return proxy;
                }

                if (prop === 'top' || prop === 'parent') {
                    if (globalContext === globalContext.parent) {
                        return proxy;
                    }

                    return globalContext[p];
                }

                if (prop === 'hasOwnProperty') {
                    return hasOwnProperty;
                }

                if (prop === 'document') {
                    return this.document;
                }

                if (prop === 'eval') {
                    return eval;
                }

                if (prop === 'string' && globalVariableWhiteList.includes(prop)) {
                    return globalContext[prop];
                }

                const actualTarget = propertiesWithGetter.has(prop)
                    ? globalContext
                    : prop in target
                    ? target
                    : globalContext;
                const value = actualTarget[prop];

                if (isPropertyFrozen(actualTarget, prop)) {
                    return value;
                }

                const boundTarget = useNativeWindowForBindingsProps.get(prop) ? nativeGlobal : globalContext;
                return getTargetValue(boundTarget, value);
            },
            has: (target, prop) => {
                return prop in cachedGlobalObjects || prop in target || prop in globalContext;
            },
            getOwnPropertyDescriptor: (target, prop) => {
                if (target.hasOwnProperty(prop)) {
                    const descriptor = Object.getOwnPropertyDescriptor(target, prop);
                    descriptorTargetMap.set(prop, 'target');
                    return descriptor;
                }

                if (globalContext.hasOwnProperty(prop)) {
                    const descriptor = Object.getOwnPropertyDescriptor(globalContext, prop);
                    descriptorTargetMap.set(prop, 'globalContext');
                    // A property cannot be reported as non-configurable, if it does not exist as an own property of the target object
                    if (descriptor && !descriptor.configurable) {
                        descriptor.configurable = true;
                    }

                    return descriptor;
                }

                return undefined;
            },
            ownKeys: target => {
                return uniq(Reflect.ownKeys(globalContext).concat(Reflect.ownKeys(target)));
            },
            defineProperty: (target, prop, attributes) => {
                const from = descriptorTargetMap.get(prop);

                switch (from) {
                    case 'globalContext':
                        return Reflect.defineProperty(globalContext, prop, attributes);
                    default:
                        return Reflect.defineProperty(target, prop, attributes);
                }
            },
            deleteProperty: (target, prop) => {
                if (target.hasOwnProperty(prop)) {
                    delete target[prop];
                    updatedValueSet.delete(prop);

                    return true;
                }

                return true;
            },
            getPrototypeOf() {
                return Reflect.getPrototypeOf(globalContext);
            },
        });

        this.proxy = proxy;

        activeSandboxCount++;

        function hasOwnProperty(key) {
            if (this !== proxy && this !== null && typeof this === 'object') {
                return Object.prototype.hasOwnProperty.call(this, key);
            }

            return fakeGlobal.hasOwnProperty(key) || globalContext.hasOwnProperty(key);
        }
    }

    active() {
        if (!this.sandboxRunning) {
            activeSandboxCount++;
        }

        this.sandboxRunning = true;
    }

    inactive() {
        if (--activeSandboxCount === 0) {
            Object.keys(this.globalWhitelistPrevDescriptor).forEach(p => {
                const descriptor = this.globalWhitelistPrevDescriptor[p];

                if (descriptor) {
                    Object.defineProperty(this.globalContext, p, descriptor);
                } else {
                    delete this.globalContext[p];
                }
            });
        }

        this.sandboxRunning = false;
    }

    patchDocument(doc) {
        this.document = doc;
    }
}
