declare let WXEnvironment;

export function isWeex() {
    typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
}
