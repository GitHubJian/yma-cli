export function isAndroid(ua: string): boolean {
    return !!ua && ua.indexOf('android') > 0;
}
