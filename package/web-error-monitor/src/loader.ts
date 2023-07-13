(function (win, doc, _script, _onerror, _onunhandledrejection) {
    function queue(exception) {
        queue.data.push(exception);
    }
    queue.data = [];

    const rawOnerror = win[_onerror];
    win[_onerror] = function (message, source, lineno, colno, exception) {
        let args = Array.prototype.slice.call(arguments);

        queue({
            e: args,
        });

        if (rawOnerror) {
            rawOnerror.call(win, message, source, lineno, colno, exception);
        }
    };

    const rawOnunhandledrejection = win[_onunhandledrejection];
    win[_onunhandledrejection] = function (exception) {
        queue({
            p: exception.reason,
        });

        if (rawOnunhandledrejection) {
            rawOnunhandledrejection.call(win, exception);
        }
    };

    const rawAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
        type,
        listener: (...args: any[]) => void,
        options
    ) {
        const wrapListener = (...args) => {
            try {
                return listener.apply(this, args);
            } catch (e) {
                throw e;
            }
        };

        return rawAddEventListener.call(this, type, wrapListener, options);
    };

    var _currentScriptTag = doc.getElementsByTagName(_script)[0];
    var _newScriptTag = doc.createElement(_script);
    _newScriptTag.src = 'url';
    _newScriptTag.crossorigin = 'anonymous';
})(window, document, 'script', 'onerror', 'onunhandledrejection');
