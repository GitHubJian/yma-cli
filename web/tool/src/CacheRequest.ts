const EventEmitter = require('./EventEmitter');

export default class CachedRequest extends EventEmitter {
    constructor(httpRequest) {
        super();

        this.httpRequest = httpRequest;
        this.cached = {};
    }

    createHashKey(key) {
        let hash = 0;
        let i;
        let chr;
        let len;
        if (key.length == 0) {
            return hash;
        }
        for (i = 0, len = key.length; i < len; i++) {
            chr = key.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }

        return hash;
    }

    normalizeOptions(options) {
        const opts = {
            url: options.url,
            method: options.method || 'GET',
            headers: options.headers || {},
            params: options.params || {},
            data: options.data || {},
            responseType: options.responseType || 'json',
        };

        return opts;
    }

    request(options, callback) {
        const that = this;
        let key = JSON.stringify(this.normalizeOptions(options));
        key = this.createHashKey(key);

        this.on(key, callback);

        if (this.cached[key] !== 'pending') {
            this.cached[key] = 'pending';

            this.httpRequest(options).then(
                function (res) {
                    that.cached[key] = 'resolve';
                    that.emit(key, res);
                    that.removeAllListeners(key);
                },
                function (e) {
                    that.cached[key] = 'reject';
                    that.emit(key, e);
                    that.removeAllListeners(key);
                }
            );
        }
    }
}
