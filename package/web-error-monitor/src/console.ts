import {safeJoin, toArray} from 'yma-tool';

export type Level = 'debug' | 'info' | 'warn' | 'error' | 'log' | 'assert';

export function wrapMethod(
    console: Console,
    level: 'debug' | 'info' | 'warn' | 'error' | 'log' | 'assert',
    callback: (...data: any[]) => void
) {
    let originalConsoleLevel = console[level];
    let originalConsole = console;

    if (!(level in console)) {
        return;
    }

    let errorLevel = level === 'warn' ? 'warning' : level;

    console[level] = function () {
        let args = toArray<any[]>(arguments);
        let msg = safeJoin(args, ' ');
        let data = {
            level: errorLevel,
            logger: 'console',
            extra: {arguments: args},
        };

        if (level === 'assert') {
            if (args[0] === false) {
                msg =
                    'Assertion failed: ' +
                    (safeJoin(args.slice(1), ' ') || 'console.assert');
                data.extra.arguments = args.slice(1);
                callback && callback(msg, data);
            }
        } else {
            callback && callback(msg, data);
        }

        if (originalConsoleLevel) {
            Function.prototype.apply.call(
                originalConsoleLevel,
                originalConsole,
                args
            );
        }
    };
}
