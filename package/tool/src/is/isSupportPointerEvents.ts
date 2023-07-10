export function isSupportPointerEvents() {
    return !!(
        window.navigator['pointerEnabled'] ||
        window.PointerEvent ||
        ('maxTouchPoints' in window.navigator &&
            window.navigator.maxTouchPoints > 0)
    );
}
