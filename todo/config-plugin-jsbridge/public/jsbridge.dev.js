const getProp = (obj, path) => {
    let name = path.split('.');

    for (let i = 0; i < name.length - 1; i++) {
        obj = obj[name[i]];
        if (typeof obj !== 'object' || !obj || Array.isArray(obj)) {
            return;
        }
    }

    return obj[name.pop()];
};

const jsbridge = (function () {
    const ns = window.__js_bridge_ns__ || '__js_bridge__';
    const instance = getProp(window, ns);

    let listeners = {};

    function on(eventName, func) {
        if (arguments.length < 2) {
            return;
        }

        if (!listeners[eventName]) {
            const addEventListener = instance && instance.addEventListener;

            addEventListener.call(instance, eventName, function (result) {
                emit(eventName, result);
            });
        }

        listeners[eventName] = listeners[eventName] || [];
        listeners[eventName].push(func);

        return function () {
            listeners[eventName] = listeners[eventName].filter(function (fn) {
                return fn !== func;
            });
        };
    }

    function emit(eventName) {
        if (!listeners[eventName] || listeners[eventName].length == 0) {
            return;
        }

        const args = Array.prototype.slice.call(arguments, 1);
        listeners[eventName].forEach(function (fn) {
            fn.apply(null, args);
        });
    }

    function remove(eventName) {
        const keys = Object.keys(listeners);

        keys.forEach(function (eName) {
            if (!eventName || (eventName && eventName === eName)) {
                const removeEventListener = instance && instance.removeEventListener;
                removeEventListener.call(instance, eName);

                // 无法移除 window 的遗留 callback
                listeners[eName] = null;
                delete listeners[eName];
            }
        });
    }

    function create(methodName, settings = {}, sync = false) {
        const beforeSend =
            settings.beforeSend ||
            function () {
                console.log(`[window.${ns}.${methodName}]: 发送请求参数`);
                console.log(settings.data);
            };
        const complete = settings.complete;
        const context = settings.context || null;

        const args = {
            method: methodName,
            params: settings.data,
        };
        if (typeof beforeSend === 'function') {
            beforeSend.call(context, args);
        }

        const that = instance;
        const fn =
            (instance && instance[methodName]) ||
            function (_, callback) {
                console.error(`[window.${ns}.${methodName}]: 未定义`);

                // 启动 mock
                if (process.env.YMA_MOCK_ENABLE) {
                    instance && instance.mock && instance.mock(args, callback);
                }
            };

        if (process.env.YMA_MOCK_ENABLE) {
            sync = false;
        }

        if (sync) {
            const result = fn.call(that, args.params || {}) || {
                code: 0,
            };

            return new Promise(function (resolve, reject) {
                console.log(`[window.${ns}.${methodName}][callback]: 同步函数执行后的返回结果`);
                console.log(result);

                if (result.code == 0) {
                    resolve(result.data);
                } else {
                    reject(reject);
                }
            });
        }

        return new Promise(function (resolve, reject) {
            fn.call(that, args.params || {}, function (result) {
                console.log(`[window.${ns}.${methodName}][callback]: 异步函数执行后的返回结果`);
                console.log(result);

                if (typeof complete === 'function') {
                    try {
                        complete.call(context, result.code !== 0 ? result : null, result.data);
                    } catch (e) {
                        const msg = `[window.${ns}.${methodName}][callback]: 回调函数执行异常`;
                        console.error(msg);
                        console.error(e);

                        reject({
                            code: 1,
                            data: null,
                            message: msg,
                        });
                    }
                } else {
                    if (result.code === 0) {
                        resolve(result.data);
                    } else {
                        reject(result);
                    }
                }
            });
        });
    }

    return {
        on,
        emit,
        remove,
        create,
    };
})();

module.exports = jsbridge;
