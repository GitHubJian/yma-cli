import {toString} from './constant';
import {isObjectLike} from './isObjectLike';

export function isArguments(v: any): boolean {
    return isObjectLike(v) && toString.call(v) === '[object Arguments]';
}
