const createSeries = require('yma-series');
const {importLink} = require('./import-link');
const {on, hasOwn, ensureSlash} = require('./util');

function httpRequest(url, completeCallback) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (200 <= xhr.status && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);

                    completeCallback && completeCallback(null, data);
                } catch (e) {
                    completeCallback &&
                        completeCallback({
                            code: 1,
                            message: '[Prefetch] Manifest 资源解析异常',
                        });
                }
            } else {
                completeCallback &&
                    completeCallback({
                        code: 1,
                        message: '[Prefetch] Manifest 资源请求异常',
                    });
            }
        }
    };

    xhr.send();
}

const defaults = function () {
    return {
        dns: './',
        force: false,
        filename: 'assets-manifest.json',
        callback: function () {
            console.log('[Preload] 执行回调');
        },
    };
};

let isInit = false;
function main(options) {
    if (isInit) {
        console.log('[Preload] 函数已被执行');
        return;
    }

    isInit = true;

    options = Object.assign({}, defaults(), options);

    const force = options.force;
    const dns = ensureSlash(options.dns);
    const callback = options.callback;
    const filename = options.filename;

    httpRequest(dns + filename, function (e, manifest) {
        if (e) {
            console.error(e);
        } else {
            const series = createSeries({
                errors: [],
            });

            for (const key in manifest) {
                if (hasOwn(manifest, key)) {
                    const val = manifest[key];
                    const uri = dns + val;

                    series.tap(function (ctx, next) {
                        importLink(uri, {
                            force: force,
                            completeCallback: function (e) {
                                if (e) {
                                    ctx.errors.push([uri, e]);
                                }

                                next();
                            },
                        });
                    });
                }
            }

            series.call(function (ctx) {
                callback(ctx);
            });
        }
    });
}

if ('complete' === document.readyState || 'interactive' === document.readyState) {
    const options = {
        force: !!window.__preload__force__,
    };

    if (typeof window.__preload__dns__ === 'string' && window.__preload__dns__.length > 0) {
        options.dns = window.__preload__dns__;
    }

    if (typeof window.__preload__filename__ === 'string' && window.__preload__filename__.length > 0) {
        options.filename = window.__preload__filename__;
    }

    if (typeof window.__preload__callback__ === 'function') {
        options.callback = window.__preload__callback__;
    }

    main(options);
} else {
    on(document, 'DOMContentLoaded', function () {
        const options = {
            force: !!window.__preload__force__,
        };

        if (typeof window.__preload__dns__ === 'string' && window.__preload__dns__.length > 0) {
            options.dns = window.__preload__dns__;
        }

        if (typeof window.__preload__filename__ === 'string' && window.__preload__filename__.length > 0) {
            options.filename = window.__preload__filename__;
        }

        if (typeof window.__preload__callback__ === 'function') {
            options.callback = window.__preload__callback__;
        }

        main(options);
    });
}

module.exports = main;
