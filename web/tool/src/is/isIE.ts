export function isIE(ua) {
    const re = /msie|trident/;

    return ua && re.test(ua);
}
