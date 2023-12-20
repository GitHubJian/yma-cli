export function isIPhone(ua) {
    return ua && /\biPhone\b|\biPod\b/i.test(ua);
}
