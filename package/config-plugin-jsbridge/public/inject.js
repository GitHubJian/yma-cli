const getProp = (obj, path) => {
    let name = path.split('.');

    for (let i = 0; i < name.length - 1; i++) {
        obj = obj[name[i]];
        if (typeof obj !== 'object' || !obj || Array.isArray(obj)) return;
    }

    return obj[name.pop()];
};

const setProp = (obj, path, value) => {
    let name = path.split('.');

    for (let i = 0; i < name.length - 1; i++) {
        if (typeof obj[name[i]] !== 'object' && obj[name[i]] !== undefined)
            return;
        if (Array.isArray(obj[name[i]])) return;
        if (!obj[name[i]]) obj[name[i]] = {};
        obj = obj[name[i]];
    }

    obj[name.pop()] = value;
};

function request(argv) {
    const url = '/api/' + argv.method;
    const callback = argv.callback;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            let res = JSON.parse(xhr.responseText);

            callback && callback(res);
        } else {
            callback &&
                callback({
                    code: 1000,
                    message: '[mock failed] -> ' + url,
                });
        }
    };

    xhr.send(argv.data);
}

const ns = window['__js_bridge_ns__'] || '__js_bridge__';
const jsbridge = (function (ns) {
    const obj = {};

    setProp(window, ns, obj);
    setProp(window, 'jsbridge', obj);

    return obj;
})(ns);
jsbridge.mock = function (argv, callback) {
    request({
        method: argv.method,
        data: argv.params,
        callback,
    });
};

const listeners = {};
jsbridge.addEventListener = function (eventName, fn) {
    listeners[eventName] = fn;
};
jsbridge.removeEventListener = function (eventName) {
    listeners[eventName] = null;

    delete listeners[eventName];
};
jsbridge.on = jsbridge.addEventListener;
jsbridge.emit = function (eventName) {
    request({
        method: eventName,
        callback: function (result) {
            if (result.code == 0) {
                // Emit 的方法无需拆封装
                listeners[eventName](result);
            } else {
                console.log(`[${ns}.${eventName}]: emit error`);
                console.log(result.message);
            }
        },
    });
};
jsbridge.dispatch = jsbridge.emit;
