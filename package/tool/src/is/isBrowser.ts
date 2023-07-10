export function isBrowser() {
    if (
        typeof navigator !== 'undefined' &&
        (navigator.product === 'ReactNative' ||
            navigator.product === 'NativeScript' ||
            navigator.product === 'NS')
    ) {
        return false;
    }

    return typeof window !== 'undefined' && typeof document !== 'undefined';
}
