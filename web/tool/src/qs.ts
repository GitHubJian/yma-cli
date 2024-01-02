function splitOnFirst(string: string, separator?: string): [string, string] | [] {
    if (!(typeof string === 'string' && typeof separator === 'string')) {
        throw new TypeError('Expected the arguments to be of type `string`');
    }

    if (string === '' || separator === '') {
        return [];
    }

    const separatorIndex = string.indexOf(separator);

    if (separatorIndex === -1) {
        return [];
    }

    return [string.slice(0, separatorIndex), string.slice(separatorIndex + separator.length)];
}

function encode(value: string | number | boolean) {
    return encodeURIComponent(value);
}

function decode(value: string) {
    return decodeURIComponent(value);
}

// 生成 query string
function stringify(object?: Record<string, any>) {
    if (!object) {
        return '';
    }

    const result: string[] = [];
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            const value = object[key];

            if (value === undefined) {
                continue;
            }

            if (value === null) {
                result.push(encode(key));
            }

            result.push(encode(key) + '=' + encode(value));
        }
    }

    return result.filter(x => x.length > 0).join('&');
}

// 解析 query object
function parse(input: string) {
    const ret: Record<string, string> = Object.create(null);

    if (typeof input !== 'string') {
        return ret;
    }

    input = input.trim().replace(/^[?#&]/, '');

    if (!input) {
        return ret;
    }

    for (const param of input.split('&')) {
        const split = splitOnFirst(param.replace(/\+/g, ' '), '=');
        let key = split[0]!;
        const value = split[1]!;

        value === undefined ? null : decode(value);

        key = decode(key);

        ret[key] = value;
    }

    return ret;
}

// 移除 hash
function removeHash(input: string) {
    const hasStart = input.indexOf('#');
    if (hasStart !== -1) {
        input = input.slice(0, hasStart);
    }

    return input;
}

// 抽离 query string
function extract(input: string) {
    input = removeHash(input);
    const queryStart = input.indexOf('?');
    if (queryStart === -1) {
        return '';
    }

    return input.slice(queryStart + 1);
}

// 解析 url
function parseUrl(input: string): {
    url: string;
    query: Record<string, string>;
} {
    return {
        url: removeHash(input).split('?')[0] || '',
        query: parse(extract(input)),
    };
}

export default {
    stringify,
    parse,
    parseUrl,
};
