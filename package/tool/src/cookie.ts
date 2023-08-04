/**
 * @file Cookie.js
 * @desc cookie 的日常操作函数
 */
const pluses = /\+/g;

function encode(s) {
    return encodeURIComponent(s);
}

function decode(s) {
    return decodeURIComponent(s);
}

function stringifyCookieValue(value) {
    return encode(JSON.stringify(value));
}

function read(s) {
    if (s.indexOf('"') === 0) {
        s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    try {
        s = decodeURIComponent(s.replace(pluses, ' '));
        return JSON.parse(s);
    } catch (error) {}
}

/**
 * setCookie
 *
 * @desc 移除 Cookie
 *
 * @param {string} key 键
 * @param {any} value 值
 * @typedef {Object} options
 * @prop {string} expires 有效期
 * @prop {string} path 路径
 * @prop {string} domain 域
 * @prop {boolean} secure 是否安全
 *
 * @return {string} document.cookie
 */
function get(key?: string): string | undefined | Record<string, string> {
    let result: string | undefined | Record<string, string> = key
        ? undefined
        : {};
    let cookies = document.cookie ? document.cookie.split('; ') : [];
    let i = 0;
    let l = cookies.length;

    for (; i < l; i++) {
        let parts = cookies[i].split('=');
        let name = decode(parts.shift());
        let cookie = parts.join('=');

        if (key === name) {
            result = read(cookie);
            break;
        }

        if (!key && (cookie = read(cookie)) !== undefined) {
            result![name] = cookie;
        }
    }

    return result;
}

/**
 * setCookie
 *
 * @desc 设置 Cookie
 *
 * @param {string} key 键
 * @param {any} value 值
 * @typedef {Object} options
 * @prop {number | Date} expires 有效期
 * @prop {string} path 路径
 * @prop {string} domain 域
 * @prop {boolean} secure 是否安全
 *
 * @return {string} document.cookie
 */
function set(
    key: string,
    value: string,
    options: Partial<{
        domain: string;
        path: string;
        expires: number | Date;
        secure: boolean;
    }>
): string {
    options = options || {};

    if (typeof options.expires === 'number') {
        const days = options.expires;
        const t = (options.expires = new Date());
        t.setMilliseconds(t.getMilliseconds() + days * 86e4 + 5);
    }

    return (document.cookie = [
        encode(key),
        '=',
        stringifyCookieValue(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute
        options.path ? '; path=' + options.path : '',
        options.domain ? '; domain=' + options.domain : '',
        options.secure ? '; secure' : '',
    ].join(''));
}

/**
 * removeCookie
 *
 * @desc 移除 Cookie
 *
 * @param {string} key 关键字
 *
 * @return {boolean}
 */
function remove(key: string) {
    set(key, '', {
        expires: -1,
    });

    return !get(key);
}

export default {
    get,
    set,
    remove,
};
