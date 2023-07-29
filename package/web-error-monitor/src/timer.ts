import {isFunction, toArray} from 'yma-tool';
import {stub, wrap} from './util';

let isInstalled = false;

export let rawSetTimeout;
export let rawSetInterval;
export let rawRequestAnimationFrame;

export function install() {
    if (isInstalled) {
        return;
    }

    rawSetTimeout = window.setTimeout;
    stub(window, 'setTimeout', function (rawFn) {
        return function (this) {
            let args = toArray(arguments) as [
                handler: () => void,
                timeout?: number
            ];
            const handler = args[0];

            if (isFunction(handler)) {
                args[0] = wrap(handler, {
                    mechanism: {
                        type: 'instrument',
                        data: {
                            function: rawFn.name || '<anonymous>',
                        },
                    },
                });
            }

            if (rawFn.apply) {
                return rawFn.apply(this, args);
            } else {
                return rawFn(args[0], args[1] || 0);
            }
        };
    });

    rawSetInterval = window.setInterval;
    stub(window, 'setInterval', function (rawFn) {
        return function (this) {
            let args = toArray(arguments) as [
                handler: () => void,
                timeout?: number
            ];
            const handler = args[0];

            if (isFunction(handler)) {
                args[0] = wrap(handler, {
                    mechanism: {
                        type: 'instrument',
                        data: {
                            function: rawFn.name || '<anonymous>',
                        },
                    },
                });
            }

            if (rawFn.apply) {
                return rawFn.apply(this, args);
            } else {
                return rawFn(args[0], args[1] || 0);
            }
        };
    });

    rawRequestAnimationFrame = window.requestAnimationFrame;
    stub(window, 'requestAnimationFrame', function (rawFn) {
        return function (callback) {
            return rawFn(
                wrap(callback, {
                    mechanism: {
                        type: 'hijack',
                        data: {
                            func: 'requestAnimationFrame',
                            handler: (rawFn && rawFn.name) || '<anonymous>',
                        },
                    },
                })
            );
        };
    });

    isInstalled = true;
}

export function uninstall() {
    if (!isInstalled) {
        return;
    }

    window.setTimeout = rawSetTimeout;
    window.setInterval = rawSetInterval;
    window.requestAnimationFrame = rawRequestAnimationFrame;

    isInstalled = false;
}
