import {
    deepmerge,
    isError,
    isErrorEvent,
    isDOMError,
    isDOMException,
    isFunction,
    isObject,
    isEmpty,
    isUndefined,
    hasOwn,
    isSupportFetch,
    isString,
    toArray,
} from 'yma-tool';
import {fill, htmlTreeAsString, ignore, parseUrl} from './util';
import {
    AddEventListenerReplacementFn,
    EvtListener,
    FetchReplacementFn,
    HistoryPushStateReplacementFn,
    HistoryReplaceStateReplacementFn,
    RequestAnimationFrameReplacementFn,
    XHRProtoOnreadystatechangeReplacementFn,
    XHRProtoOpenReplacementFn,
    XHRProtoSendReplacementFn,
} from './constant';
import {wrapMethod as wrapConsoleMethod} from './console';
import {computeStackTrace} from './trace';

interface Crumb {
    timestamp: number;
    [key: string]: any;
}

class ErrorMonitor {
    _globalOptions: {
        ignoreErrors: Array<RegExp>;
        ignoreUrls: Array<RegExp>;
        whitelistUrls: Array<RegExp>;
        autoBreadcrumbs: {
            xhr: boolean;
            console: boolean;
            dom: boolean;
            location: boolean;
        };
        breadcrumbCallback: (crumb: Crumb) => Crumb | false;
        maxBreadcrumbs: number;
        captureTryCatch: boolean;
        captureUnhandledRejections: boolean;
    };

    _isInstalled: boolean;
    _originalErrorStackTraceLimit: number;
    _originalConsole: Console;
    _originalConsoleMethods: Partial<Console>;
    _wrappedBuiltIns: Array<any>;
    _breadcrumbs: Array<Crumb>;

    _lastCapturedEvent: null | Event;
    _keypressTimeout?: null | number;

    _location: Location;
    _lastHref?: string;

    _originalFunctionToString?: () => string;

    _lastCapturedException: null | Error;

    constructor() {
        this._globalOptions = {
            ignoreErrors: [],
            ignoreUrls: [],
            whitelistUrls: [],
            autoBreadcrumbs: {
                xhr: true,
                console: true,
                dom: true,
                location: true,
            },
            breadcrumbCallback: () => false,
            maxBreadcrumbs: 100,
            captureTryCatch: true,
            captureUnhandledRejections: true,
        };

        this._isInstalled = false;
        this._originalErrorStackTraceLimit = Error.stackTraceLimit;
        this._originalConsole = window.console || {};
        this._originalConsoleMethods = {};
        this._wrappedBuiltIns = [];
        this._breadcrumbs = [];

        this._lastCapturedEvent = null;
        this._keypressTimeout = null;

        this._location = window.location;
        this._lastHref = this._location.href;

        this._lastCapturedException = null;
    }

    _breadcrumbEventHandler(evtName: string) {
        let self = this;

        return function (evt: Event) {
            self._keypressTimeout = null;
            if (self._lastCapturedEvent === evt) {
                return;
            }

            self._lastCapturedEvent = evt;

            var target;
            try {
                target = htmlTreeAsString(evt.target as Element);
            } catch (e) {
                target = '<unknown>';
            }

            self.captureBreadcrumb({
                category: 'ui.' + evtName, // e.g. ui.click, ui.input
                message: target,
            });
        };
    }

    _keypressEventHandler() {
        let self = this,
            delay = 1000;

        return function (evt: Event) {
            let target;
            try {
                target = evt.target;
            } catch (e) {
                return;
            }

            let tagName = target && target.tagName;
            if (
                !tagName ||
                (tagName !== 'INPUT' &&
                    tagName !== 'TEXTAREA' &&
                    !target.isContentEditable)
            ) {
                return;
            }

            let timer = self._keypressTimeout;
            if (!timer) {
                self._breadcrumbEventHandler('input')(evt);
            }

            clearTimeout(timer!);

            self._keypressTimeout = window.setTimeout(function () {
                self._keypressTimeout = null;
            }, delay);
        };
    }

    _promiseRejectionHandler(event) {
        this.captureException(event.reason, {
            mechanism: {
                type: 'onunhandledrejection',
                handled: false,
            },
        });
    }

    _attachPromiseRejectionHandler() {
        this._promiseRejectionHandler =
            this._promiseRejectionHandler.bind(this);

        window.addEventListener &&
            window.addEventListener(
                'unhandledrejection',
                this._promiseRejectionHandler
            );

        return this;
    }

    _detachPromiseRejectionHandler() {
        window.removeEventListener &&
            window.removeEventListener(
                'unhandledrejection',
                this._promiseRejectionHandler
            );
        return this;
    }

    _captureUrlChange(from?: string, to?: string) {
        let parsedLoc = parseUrl(this._location.href);
        let parsedTo = parseUrl(to);
        let parsedFrom = parseUrl(from);

        this._lastHref = to;
        if (
            parsedLoc.protocol === parsedTo.protocol &&
            parsedLoc.host === parsedTo.host
        ) {
            to = parsedTo.relative;
        }

        if (
            parsedLoc.protocol === parsedFrom.protocol &&
            parsedLoc.host === parsedFrom.host
        ) {
            from = parsedFrom.relative;
        }

        this.captureBreadcrumb({
            category: 'navigation',
            data: {
                to: to,
                from: from,
            },
        });
    }

    _patchFunctionToString() {
        let self = this;
        self._originalFunctionToString = Function.prototype.toString;

        Function.prototype.toString = function () {
            let args = toArray(arguments) as [];
            if (typeof this === 'function' && this['__em__']) {
                return self._originalFunctionToString!.apply(
                    this['__raw__'],
                    args
                );
            }

            return self._originalFunctionToString!.apply(this, args);
        };
    }

    _unpatchFunctionToString() {
        if (this._originalFunctionToString) {
            Function.prototype.toString = this._originalFunctionToString!;
        }
    }

    _instrumentTryCatch() {
        let self = this;
        let wrappedBuiltIns = self._wrappedBuiltIns;

        function wrapTimeFn(rawFn) {
            return function (this) {
                let args = toArray(arguments);
                var originalCallback = args[0];

                if (isFunction(originalCallback)) {
                    args[0] = self.wrap(
                        {
                            mechanism: {
                                type: 'instrument',
                                data: {
                                    function: rawFn.name || '<anonymous>',
                                },
                            },
                        },
                        originalCallback
                    );
                }

                if (rawFn.apply) {
                    return rawFn.apply(this, args);
                } else {
                    return rawFn(args[0], args[1]);
                }
            };
        }

        let autoBreadcrumbs = self._globalOptions.autoBreadcrumbs;
        function wrapEventTarget(global: string) {
            let proto = window[global] && window[global]['prototype'];
            if (
                proto &&
                proto.hasOwnProperty &&
                proto.hasOwnProperty('addEventListener')
            ) {
                fill<AddEventListenerReplacementFn>(
                    proto,
                    'addEventListener',
                    function (rawFn) {
                        return function (this, evtName, fn, options) {
                            debugger;
                            try {
                                if (fn && fn.handleEvent) {
                                    fn.handleEvent = self.wrap(
                                        {
                                            mechanism: {
                                                type: 'instrument',
                                                data: {
                                                    target: global,
                                                    function: 'handleEvent',
                                                    handler:
                                                        (fn && fn.name) ||
                                                        '<anonymous>',
                                                },
                                            },
                                        },
                                        fn.handleEvent
                                    );
                                }
                            } catch (e) {}

                            let before, clickHandler, keypressHandler;
                            if (
                                autoBreadcrumbs &&
                                autoBreadcrumbs.dom &&
                                (global === 'EventTarget' || global === 'Node')
                            ) {
                                clickHandler =
                                    self._breadcrumbEventHandler('click');
                                keypressHandler = self._keypressEventHandler();

                                before = function (evt) {
                                    if (!evt) return;

                                    let eventType;
                                    try {
                                        eventType = evt.type;
                                    } catch (e) {
                                        return;
                                    }

                                    if (eventType === 'click') {
                                        return clickHandler(evt);
                                    } else if (eventType === 'keypress') {
                                        return keypressHandler(evt);
                                    }
                                };
                            }

                            return rawFn.call(
                                this,
                                evtName,
                                self.wrap(
                                    {
                                        mechanism: {
                                            type: 'instrument',
                                            data: {
                                                target: global,
                                                function: 'addEventListener',
                                                handler:
                                                    (fn && fn.name) ||
                                                    '<anonymous>',
                                            },
                                        },
                                    },
                                    fn,
                                    before
                                ),
                                true
                            );
                        };
                    },
                    wrappedBuiltIns
                );
            }
        }

        fill(window, 'setTimeout', wrapTimeFn, wrappedBuiltIns);
        fill(window, 'setInterval', wrapTimeFn, wrappedBuiltIns);
        if (!!window.requestAnimationFrame) {
            fill<RequestAnimationFrameReplacementFn>(
                window,
                'requestAnimationFrame',
                function (rawFn) {
                    return function (callback) {
                        return rawFn(
                            self.wrap(
                                {
                                    mechanism: {
                                        type: 'instrument',
                                        data: {
                                            function: 'requestAnimationFrame',
                                            handler:
                                                (rawFn && rawFn.name) ||
                                                '<anonymous>',
                                        },
                                    },
                                },
                                callback
                            )
                        );
                    };
                },
                wrappedBuiltIns
            );
        }

        var eventTargets = [
            'EventTarget',
            'Window',
            // 'Node',
            // 'ApplicationCache',
            // 'AudioTrackList',
            // 'ChannelMergerNode',
            // 'CryptoOperation',
            // 'EventSource',
            // 'FileReader',
            // 'HTMLUnknownElement',
            // 'IDBDatabase',
            // 'IDBRequest',
            // 'IDBTransaction',
            // 'KeyOperation',
            // 'MediaController',
            // 'MessagePort',
            // 'ModalWindow',
            // 'Notification',
            // 'SVGElementInstance',
            // 'Screen',
            // 'TextTrack',
            // 'TextTrackCue',
            // 'TextTrackList',
            // 'WebSocket',
            // 'WebSocketWorker',
            // 'Worker',
            // 'XMLHttpRequest',
            // 'XMLHttpRequestEventTarget',
            // 'XMLHttpRequestUpload',
        ];

        for (let i = 0; i < eventTargets.length; i++) {
            debugger
            wrapEventTarget(eventTargets[i]);
        }
    }

    _instrumentBreadcrumbs() {
        let self = this;
        let autoBreadcrumbs = self._globalOptions.autoBreadcrumbs;
        var wrappedBuiltIns = self._wrappedBuiltIns;

        function wrapProp(prop: string, xhr: Object) {
            if (prop in xhr && isFunction(xhr[prop])) {
                fill(xhr, prop, function (orig) {
                    return self.wrap(
                        {
                            mechanism: {
                                type: 'instrument',
                                data: {
                                    function: prop,
                                    handler:
                                        (orig && orig.name) || '<anonymous>',
                                },
                            },
                        },
                        orig
                    );
                });
            }
        }

        if (autoBreadcrumbs.xhr && 'XMLHttpRequest' in window) {
            var xhrProto =
                window.XMLHttpRequest && window.XMLHttpRequest.prototype;

            fill<XHRProtoOpenReplacementFn>(
                xhrProto,
                'open',
                function (rawFn) {
                    return function (this, method, url) {
                        if (isString(url)) {
                            this.__xhr__ = {
                                method,
                                url,
                                status_code: null,
                            };
                        }

                        let args = toArray(arguments) as [
                            method: string,
                            url: string | URL
                        ];
                        return rawFn.apply(this, args);
                    };
                },
                wrappedBuiltIns
            );

            fill<XHRProtoSendReplacementFn>(
                xhrProto,
                'send',
                function (rawFn) {
                    return function (this) {
                        let xhr = this;

                        function onreadystatechangeHandler() {
                            if (xhr.__xhr && xhr.readyState === 4) {
                                try {
                                    xhr._xhr.status_code = xhr.status;
                                } catch (e) {}

                                self.captureBreadcrumb({
                                    type: 'http',
                                    category: 'xhr',
                                    data: xhr.__em_xhr,
                                });
                            }
                        }

                        let props = ['onload', 'onerror', 'onprogress'];
                        for (let j = 0; j < props.length; j++) {
                            wrapProp(props[j], xhr);
                        }

                        if (
                            'onreadystatechange' in xhr &&
                            isFunction(xhr.onreadystatechange)
                        ) {
                            fill<XHRProtoOnreadystatechangeReplacementFn>(
                                xhr,
                                'onreadystatechange',
                                function (rawFn$1) {
                                    return self.wrap(
                                        {
                                            mechanism: {
                                                type: 'instrument',
                                                data: {
                                                    function:
                                                        'onreadystatechange',
                                                    handler:
                                                        (rawFn$1 &&
                                                            rawFn$1.name) ||
                                                        '<anonymous>',
                                                },
                                            },
                                        },
                                        rawFn$1,
                                        onreadystatechangeHandler
                                    );
                                }
                            );
                        } else {
                            xhr.onreadystatechange = onreadystatechangeHandler;
                        }
                    };
                },
                wrappedBuiltIns
            );
        }

        if (autoBreadcrumbs.xhr && isSupportFetch(window)) {
            fill<FetchReplacementFn>(
                window,
                'fetch',
                function (rawFn) {
                    return function (this) {
                        let args = toArray(arguments) as [
                            input: RequestInfo | URL,
                            init?: RequestInit
                        ];
                        let fetchInput = args[0];
                        let method = 'GET';
                        let url;

                        if (isString(fetchInput)) {
                            url = fetchInput;
                        } else if (
                            'Request' in window &&
                            fetchInput instanceof window.Request
                        ) {
                            url = fetchInput.url;

                            if (fetchInput.method) {
                                method = fetchInput.method;
                            }
                        } else {
                            url = '' + fetchInput;
                        }

                        if (args[1] && args[1].method) {
                            method = args[1].method;
                        }

                        let fetchData: {
                            method: string;
                            url: string;
                            status_code: null | number;
                        } = {
                            method: method,
                            url: url,
                            status_code: null,
                        };

                        return rawFn
                            .apply(this, args)
                            .then(function (response) {
                                fetchData.status_code = response.status;

                                self.captureBreadcrumb({
                                    type: 'http',
                                    category: 'fetch',
                                    data: fetchData,
                                });

                                return response;
                            })
                            .catch(function (err) {
                                self.captureBreadcrumb({
                                    type: 'http',
                                    category: 'fetch',
                                    data: fetchData,
                                    level: 'error',
                                });

                                throw err;
                            });
                    };
                },
                wrappedBuiltIns
            );
        }

        if (autoBreadcrumbs.dom) {
            document.addEventListener(
                'click',
                self._breadcrumbEventHandler('click'),
                false
            );
            document.addEventListener(
                'keypress',
                self._keypressEventHandler(),
                false
            );
        }

        if (autoBreadcrumbs.location && 'history' in window) {
            const rawOnpopstate = window.onpopstate;
            window.onpopstate = function () {
                const args = toArray(arguments) as [ev: PopStateEvent];
                let currentHref = self._location.href;
                self._captureUrlChange(self._lastHref, currentHref);

                if (rawOnpopstate) {
                    return rawOnpopstate.apply(this, args);
                }
            };

            fill<HistoryPushStateReplacementFn>(
                window.history,
                'pushState',
                function (rawFn) {
                    return function (this) {
                        let args = toArray(arguments) as [
                            data: any,
                            unused: string,
                            url?: string | URL | null
                        ];
                        let url = args.length > 2 ? args[2] : undefined;

                        if (url) {
                            self._captureUrlChange(self._lastHref, url + '');
                        }

                        return rawFn.apply(this, args);
                    };
                },
                wrappedBuiltIns
            );
            fill<HistoryReplaceStateReplacementFn>(
                window.history,
                'replaceState',
                function (rawFn) {
                    return function (this) {
                        let args = toArray(arguments) as [
                            data: any,
                            unused: string,
                            url?: string | URL | null
                        ];
                        let url = args.length > 2 ? args[2] : undefined;

                        if (url) {
                            self._captureUrlChange(self._lastHref, url + '');
                        }

                        return rawFn.apply(this, args);
                    };
                },
                wrappedBuiltIns
            );
        }

        if (autoBreadcrumbs.console && 'console' in window && !!console.log) {
            let consoleMethodCallback = function (
                msg: string,
                data: Record<string, any>
            ) {
                self.captureBreadcrumb({
                    message: msg,
                    level: data.level,
                    category: 'console',
                });
            };

            wrapConsoleMethod(console, 'debug', consoleMethodCallback);
            wrapConsoleMethod(console, 'info', consoleMethodCallback);
            wrapConsoleMethod(console, 'warn', consoleMethodCallback);
            wrapConsoleMethod(console, 'error', consoleMethodCallback);
            wrapConsoleMethod(console, 'log', consoleMethodCallback);
            wrapConsoleMethod(console, 'assert', consoleMethodCallback);
        }
    }

    _restoreBuiltIns() {
        let builtin;
        while (this._wrappedBuiltIns.length) {
            builtin = this._wrappedBuiltIns.shift();

            var obj = builtin[0],
                name = builtin[1],
                orig = builtin[2];

            obj[name] = orig;
        }
    }

    _restoreConsole() {
        for (var method in this._originalConsoleMethods) {
            this._originalConsole[method] =
                this._originalConsoleMethods[method];
        }
    }

    _send(data) {
        var self = this;
        var globalOptions = this._globalOptions;
        (global.transport || this._makeRequest).call(this, {
            url: self._globalEndpoint,
            data: data,
        });
    }

    _makeRequest(options) {}

    install() {
        var self = this;
        if (!self._isInstalled) {
            if (self._globalOptions.captureUnhandledRejections) {
                self._attachPromiseRejectionHandler();
            }

            self._patchFunctionToString();
            debugger;
            if (self._globalOptions.captureTryCatch) {
                self._instrumentTryCatch();
            }

            if (self._globalOptions.autoBreadcrumbs) {
                self._instrumentBreadcrumbs();
            }

            self._isInstalled = true;
        }
    }

    context(options, func, args) {
        if (isFunction(options)) {
            args = func || [];
            func = options;
            options = {};
        }

        return this.wrap(options, func).apply(this, args);
    }

    wrap(options, func, _before?: () => void) {
        var self = this;
        if (isUndefined(func) && !isFunction(options)) {
            return options;
        }

        if (isFunction(options)) {
            func = options;
            options = undefined;
        }

        if (!isFunction(func)) {
            return func;
        }

        try {
            if (func.__em__) {
                return func;
            }

            if (func.__em_wrapper__) {
                return func.__em_wrapper__;
            }
        } catch (e) {
            return func;
        }

        function wrapped(this) {
            var args: any[] = [],
                i = arguments.length,
                deep = !options || (options && options.deep !== false);

            if (_before && isFunction(_before)) {
                _before.apply(this, toArray(arguments) as []);
            }

            while (i--) {
                args[i] = deep
                    ? self.wrap(options, arguments[i])
                    : arguments[i];
            }
            try {
                return func.apply(this, args);
            } catch (e) {
                self.captureException(e as Error, options);

                throw e;
            }
        }

        for (var property in func) {
            if (hasOwn(func, property)) {
                wrapped[property] = func[property];
            }
        }

        wrapped.prototype = func.prototype;

        func.__em_wrapper__ = wrapped;
        wrapped.__em__ = true;
        wrapped.__raw__ = func;

        return wrapped as EvtListener;
    }

    uninstall() {
        this._detachPromiseRejectionHandler();
        this._unpatchFunctionToString();
        this._restoreBuiltIns();
        this._restoreConsole();

        Error.stackTraceLimit = this._originalErrorStackTraceLimit;
        this._isInstalled = false;

        return this;
    }

    captureException(
        ex: ErrorEvent | DOMException | Error | string,
        options: Record<string, any> = {}
    ) {
        options = deepmerge({trimHeadFrames: 0}, options ? options : {});

        if (isErrorEvent(ex) && (ex = ex as ErrorEvent) && ex.error) {
            ex = ex.error;
        } else if (
            (isDOMError(ex) || isDOMException(ex)) &&
            (ex = ex as DOMException)
        ) {
            debugger;
            var name =
                ex.name || (isDOMError(ex) ? 'DOMError' : 'DOMException');
            var message = ex.message ? name + ': ' + ex.message : name;

            return this.captureMessage(
                message,
                deepmerge(options, {
                    stacktrace: true,
                    trimHeadFrames: options.trimHeadFrames + 1,
                })
            );
        } else if (isError(ex)) {
            ex = ex as Error;
        } else {
            ex = ex as string;

            return this.captureMessage(
                ex,
                deepmerge(options, {
                    stacktrace: true,
                    trimHeadFrames: options.trimHeadFrames + 1,
                })
            );
        }

        this._lastCapturedException = ex as Error;

        try {
            var stack = (ex as Error).stack;
            // this._handleStackInfo(stack, options);
        } catch (ex1) {
            if (ex !== ex1) {
                throw ex1;
            }
        }

        return this;
    }

    captureMessage(msg: string, options = {}) {
        if (ignore(msg, this._globalOptions.ignoreErrors)) {
            return;
        }

        msg = msg + '';
        var data = deepmerge(
            {
                message: msg,
            },
            options
        );

        var ex;

        try {
            throw new Error(msg);
        } catch (ex1) {
            ex = ex1;
        }

        ex.name = null;
        let stackTrace = computeStackTrace(ex);

        let initialCall =
            Array.isArray(stackTrace.stack) && stackTrace.stack[1];

        var fileurl = (initialCall && initialCall.url) || '';

        if (ignore(fileurl, this._globalOptions.ignoreUrls)) {
            return;
        }

        if (ignore(fileurl, this._globalOptions.whitelistUrls)) {
            return;
        }

        // this._send(data);

        return this;
    }

    captureBreadcrumb(obj) {
        var crumb = deepmerge<Crumb>(
            {
                timestamp: Date.now() / 1000,
            },
            obj
        );

        if (isFunction(this._globalOptions.breadcrumbCallback)) {
            var result = this._globalOptions.breadcrumbCallback(crumb);

            if (isObject(result) && !isEmpty(result)) {
                crumb = result as Crumb;
            } else if (result === false) {
                return this;
            }
        }

        this._breadcrumbs.push(crumb);
        if (this._breadcrumbs.length > this._globalOptions.maxBreadcrumbs) {
            this._breadcrumbs.shift();
        }

        return this;
    }
}

export default ErrorMonitor;
