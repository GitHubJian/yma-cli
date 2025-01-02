const {noop} = require('./util');

function getAsByUri(uri) {
    const pairs = uri.split('.');
    const extname = pairs.pop();
    const ext = '.' + extname;

    switch (true) {
        case ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].indexOf(ext) > -1:
            return 'image';
        case ['.js'].indexOf(ext) > -1:
            return 'script';
        case ['.css'].indexOf(ext) > -1:
            return 'style';
        case ['.ttf', '.otf', '.woff', '.woff2'].indexOf(ext) > -1:
            return 'font';
        case ['.json'].indexOf(ext) > -1:
            return 'fetch';
        // case [
        //     '.html',
        //     '.htm',
        //     '.xml',
        //     '.svg',
        //     '.md',
        //     '.pdf',
        //     '.doc',
        //     '.docx',
        //     '.xls',
        //     '.xlsx',
        // ].indexOf(ext) > -1:
        //     return 'document';
        // case ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.aiff'].indexOf(ext) >
        //     -1:
        //     return 'audio';
        // case ['.mp4', '.webm', '.avi', '.mov', '.flv'].indexOf(ext) > -1:
        //     return 'audio';
        default:
            return 'fetch';
    }
}

exports.importLink = function importLink(uri, options = {}) {
    let retry = options.retry || 3;

    const force = options.force || false;
    const successCallback = options.successCallback || noop;
    const failureCallback = options.failureCallback || noop;
    const completeCallback = options.completeCallback || noop;

    const as = getAsByUri(uri);

    const parent = document.getElementsByTagName('head')[0];

    function loadLink() {
        const link = document.createElement('link');
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', as);

        link.href = uri;

        link.onload = function () {
            successCallback && successCallback();
            completeCallback && completeCallback(null);
        };

        link.onerror = function (e) {
            failureCallback && failureCallback(e);

            setTimeout(() => {
                if (retry > 0) {
                    parent.removeChild(link);

                    retry--;

                    loadLink();
                } else {
                    completeCallback && completeCallback(e);
                }
            }, 10);
        };

        parent.appendChild(link);

        return link;
    }

    function loadScript() {
        const link = document.createElement('script');

        link.src = uri;

        link.onload = function () {
            successCallback && successCallback();
            completeCallback && completeCallback(null);
        };

        link.onerror = function (e) {
            failureCallback && failureCallback(e);

            setTimeout(() => {
                if (retry > 0) {
                    parent.removeChild(link);

                    retry--;

                    loadScript();
                } else {
                    completeCallback && completeCallback(e);
                }
            }, 10);
        };

        parent.appendChild(link);

        return link;
    }

    function loadCSS() {
        const link = document.createElement('link');

        link.href = uri;

        link.onload = function () {
            successCallback && successCallback();
            completeCallback && completeCallback(null);
        };

        link.onerror = function (e) {
            failureCallback && failureCallback(e);

            setTimeout(() => {
                if (retry > 0) {
                    parent.removeChild(link);

                    retry--;

                    loadCSS();
                } else {
                    completeCallback && completeCallback(e);
                }
            }, 10);
        };

        parent.appendChild(link);

        return link;
    }

    if (force) {
        if (as === 'script') {
            loadScript();
        } else if (as === 'style') {
            loadCSS();
        } else {
            loadLink();
        }
    } else {
        loadLink();
    }
};
