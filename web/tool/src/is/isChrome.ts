import {isEdge} from './isEdge';

export function isChrome(ua: string) {
    return !!ua && /chrome\/\d+/.test(ua) && !isEdge(ua);
}
