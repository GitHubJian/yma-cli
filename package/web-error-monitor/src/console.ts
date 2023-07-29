import {toArray} from 'yma-tool';
import {stub} from './util';

let replacement = function (rawFn, level) {
    return function () {
        const args = toArray(arguments);

        captureBreadcrumb({
            message: msg,
            level: level,
            category: 'console',
        });

        rawFn.apply(null, args);
    };
};

let isInstalled = false;

export let rawDebug;
export let rawInfo;
export let rawWarn;
export let rawError;
export let rawLog;
export let rawAssert;

export function install() {
    if (isInstalled) {
        return;
    }

    rawDebug = console.debug;
    stub(console, 'debug', replacement);
    rawInfo = console.info;
    stub(console, 'info', replacement);
    rawWarn = console.warn;
    stub(console, 'warn', replacement);
    rawError = console.error;
    stub(console, 'error', replacement);
    rawLog = console.log;
    stub(console, 'log', replacement);
    rawAssert = console.assert;
    stub(console, 'assert', replacement);

    isInstalled = true;
}

export function uninstall() {
    if (!isInstalled) {
        return;
    }

    console.debug = rawDebug;
    console.info = rawInfo;
    console.warn = rawWarn;
    console.error = rawError;
    console.log = rawLog;
    console.assert = rawAssert;

    isInstalled = false;
}
