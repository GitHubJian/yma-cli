import {isString} from 'yma-tool';

export function fill<T extends (v: any) => void>(
    obj: Record<string, any>,
    name: string,
    replacement: T,
    track?: Array<[Record<string, any>, string, T]>
) {
    if (obj == null) {
        return;
    }

    let rawFn = obj[name];
    obj[name] = replacement(rawFn);
    obj[name].__em__ = true;
    obj[name].__raw__ = rawFn;

    if (track) {
        track.push([obj, name, rawFn]);
    }
}

export function htmlTreeAsString(el: Element) {
    let MAX_TRAVERSE_HEIGHT = 5,
        MAX_OUTPUT_LEN = 80,
        out: string[] = [],
        height = 0,
        len = 0,
        separator = ' > ',
        sepLength = separator.length,
        nextStr;

    while (el && height++ < MAX_TRAVERSE_HEIGHT) {
        nextStr = htmlElementAsString(el);

        if (
            nextStr === 'html' ||
            (height > 1 &&
                len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN)
        ) {
            break;
        }

        out.push(nextStr);

        len += nextStr.length;

        el = el.parentNode as Element;
    }

    return out.reverse().join(separator);
}

function htmlElementAsString(el: Element) {
    let out: string[] = [],
        className,
        classes,
        key,
        attr,
        i;

    if (!el || !el.tagName) {
        return '';
    }

    out.push(el.tagName.toLowerCase());

    if (el.id) {
        out.push('#' + el.id);
    }

    className = el.className;
    if (className && isString(className)) {
        classes = className.split(/\s+/);
        for (i = 0; i < classes.length; i++) {
            out.push('.' + classes[i]);
        }
    }

    let attrWhitelist = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < attrWhitelist.length; i++) {
        key = attrWhitelist[i];
        attr = el.getAttribute(key);

        if (attr) {
            out.push('[' + key + '=' + attr + ']');
        }
    }

    return out.join();
}

export function parseUrl(url?: string): Partial<{
    protocol: string;
    host: string;
    path: string;
    relative: string;
}> {
    if (typeof url !== 'string') return {};

    let match = url.match(
        /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/
    )!;

    let query = match[6] || '';
    let fragment = match[8] || '';
    return {
        protocol: match[2],
        host: match[4],
        path: match[5],
        relative: match[5] + query + fragment,
    };
}

export function ignore(pattern: string, list: Array<RegExp> = []) {
    for (let i = 0; i < list.length; i++) {
        let currentPattern = list[i];

        if (currentPattern.test(pattern)) {
            return true;
        }
    }

    return false;
}
