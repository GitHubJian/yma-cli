import {toString} from './constant';

export function isEvent(v) {
    let tag = toString.call(v);

    return tag == '[object Event]';
}
