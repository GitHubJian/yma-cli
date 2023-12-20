import {isFunction, toArray} from 'package/tool/dist';
import {stub, wrap} from './util';

let isInstalled = false;

function replace(obj: Record<string, any>, prop: string) {
    if (prop in obj && isFunction(obj[prop])) {
        stub(obj, prop, function (rawFn) {
            return wrap(rawFn, {
                mechanism: {
                    type: 'instrument',
                    data: {
                        function: prop,
                        handler: (rawFn && rawFn.name) || '<anonymous>',
                    },
                },
            });
        });
    }
}

let uuid = 0;

let rawXHRProtoOpen;
let rawXHRProtoSend;
let rawXHRCache: Array<
    [
        XMLHttpRequest,
        (this: XMLHttpRequest, ev: ProgressEvent) => any,
        (this: XMLHttpRequest, ev: ProgressEvent) => any,
        (this: XMLHttpRequest, ev: ProgressEvent) => any
    ]
> = [];

export function install() {
    if (isInstalled) {
        return;
    }

    if ('XMLHttpRequest' in window) {
        const XHRProto = window.XMLHttpRequest.prototype;

        rawXHRProtoOpen = window.XMLHttpRequest.prototype.open;
        stub(XHRProto, 'open', function (rawFn) {
            return function (this) {
                let args = toArray(arguments) as [method: string, url: string];

                return rawFn.apply(this, args);
            };
        });

        rawXHRProtoSend = window.XMLHttpRequest.prototype.send;
        stub(XHRProto, 'send', function (rawFn) {
            return function (this) {
                const xhr = this;

                function before() {
                    if (xhr._xhr && xhr.readyState === 4) {
                        try {
                            xhr._xhr.status_code = xhr.status;
                        } catch (e) {}

                        captureBreadcrumb({
                            type: 'http',
                            category: 'xhr',
                        });
                    }
                }

                const xhrCache = [xhr];
                const props = ['onload', 'onerror', 'onprogress'];
                for (let j = 0; j < props.length; j++) {
                    xhrCache.push(xhr[props[j]]);

                    replace(xhr, props[j]);
                }

                if (
                    'onreadystatechange' in xhr &&
                    isFunction(xhr.onreadystatechange)
                ) {
                    stub(xhr, 'onreadystatechange', function (xhrRawFn) {
                        return wrap(xhrRawFn, {
                            before: before,
                            mechanism: {
                                type: 'instrument',
                                data: {
                                    function: 'onreadystatechange',
                                    handler:
                                        (xhrRawFn && xhrRawFn.name) ||
                                        '<anonymous>',
                                },
                            },
                        });
                    });
                } else {
                    xhr.onreadystatechange = before;
                }
            };
        });

        isInstalled = true;
    }
}

export function uninstall() {
    if (!isInstalled) {
        return;
    }

    if ('XMLHttpRequest' in window) {
        window.XMLHttpRequest.prototype.open = rawXHROpen;

        isInstalled = false;
    }
}
