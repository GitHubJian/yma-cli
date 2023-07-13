const UNKNOWN_FUNCTION = '?';

function getLocationHref() {
    if (typeof document === 'undefined' || document.location == null) return '';
    return document.location.href;
}

function getLocationOrigin() {
    if (typeof document === 'undefined' || document.location == null) return '';

    // Oh dear IE10...
    if (!document.location.origin) {
        return (
            document.location.protocol +
            '//' +
            document.location.hostname +
            (document.location.port ? ':' + document.location.port : '')
        );
    }

    return document.location.origin;
}

interface Stack {
    name: string;
    message: string;
    url: string;
    stack?: Array<Partial<Element>>;
}

export var report = (function () {
    let lastArgs: Array<any> = [],
        lastException: Error | null = null,
        lastExceptionStack: Stack | null = null;

    function report(ex: Error, rethrow: boolean) {
        let args = Array.prototype.slice.call(arguments, 1);

        if (lastExceptionStack) {
            if (lastException === ex) {
                return;
            } else {
                processLastException();
            }
        }

        let stack = computeStackTrace(ex);
        lastExceptionStack = stack;
        lastException = ex;
        lastArgs = args;

        setTimeout(
            function () {
                if (lastException === ex) {
                    processLastException();
                }
            },
            stack.incomplete ? 2000 : 0
        );

        if (rethrow !== false) {
            throw ex;
        }
    }

    return report;
})();

interface Element {
    url: string | null;
    func: string;
    args: Array<any>;
    line: number | null;
    column: number | null;
}

export var computeStackTrace = (function () {
    function computeStackTraceFromStackProp(ex: Error) {
        if (typeof ex.stack === 'undefined' || !ex.stack) return;

        const chrome =
            /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
        const winjs =
            /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx(?:-web)|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
        const chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;

        let lines = ex.stack.split('\n');
        let stack: Array<Partial<Element>> = [];
        let submatch;
        let parts;
        let element: Partial<Element> = {};

        for (let i = 0, j = lines.length; i < j; ++i) {
            if ((parts = chrome.exec(lines[i]))) {
                let isNative = parts[2] && parts[2].indexOf('native') === 0;
                let isEval = parts[2] && parts[2].indexOf('eval') === 0;
                if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                    parts[2] = submatch[1]; // url
                    parts[3] = submatch[2]; // line
                    parts[4] = submatch[3]; // column
                }

                element = {
                    url: !isNative ? parts[2] : null,
                    func: parts[1] || UNKNOWN_FUNCTION,
                    args: isNative ? [parts[2]] : [],
                    line: parts[3] ? +parts[3] : null,
                    column: parts[4] ? +parts[4] : null,
                };
            } else if ((parts = winjs.exec(lines[i]))) {
                element = {
                    url: parts[2],
                    func: parts[1] || UNKNOWN_FUNCTION,
                    args: [],
                    line: +parts[3],
                    column: parts[4] ? +parts[4] : null,
                };
            } else {
                continue;
            }

            if (!element.func && element.line) {
                element.func = UNKNOWN_FUNCTION;
            }

            stack.push(element);
        }

        if (!stack.length) {
            return null;
        }

        return {
            name: ex.name,
            message: ex.message,
            url: getLocationHref(),
            stack: stack,
        };
    }

    function computeStackTrace(ex: Error, depth: number = 0) {
        let stack:
            | {
                  name: string;
                  message: string;
                  url: string;
                  stack?: Array<Partial<Element>>;
              }
            | null
            | undefined;

        try {
            stack = computeStackTraceFromStackProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            throw e;
        }

        return {
            name: ex.name,
            message: ex.message,
            url: getLocationHref(),
        };
    }

    return computeStackTrace;
})();
