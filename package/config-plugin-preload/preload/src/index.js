const createSeries = require('yma-series');
const {importLink} = require('./import-link');
const {on, hasOwn} = require('./util');

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

function main() {
    const force = window.__preload__force__ === true;
    const dns = window.__preload__dns__ || './';
    const callback = window.__preload__callback__ || function () {};

    httpRequest(dns + 'assets-manifest.json', function (e, manifest) {
        if (e) {
            console.error(e);
        } else {
            const series = createSeries({
                errors: [],
            });

            for (const key in manifest) {
                if (hasOwn(manifest, key)) {
                    const val = manifest[key];

                    series.tap(function (ctx, next) {
                        importLink(val, {
                            force: force,
                            completeCallback: function (e) {
                                if (e) {
                                    ctx.errors.push([val, e]);
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
    main();
} else {
    on(document, 'DOMContentLoaded', main);
}
