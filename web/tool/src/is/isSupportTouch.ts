export function isSupportTouch() {
    return (
        (window.Modernizr && window.Modernizr.touch === true) ||
        (function checkTouch() {
            return !!(
                window.navigator.maxTouchPoints > 0 ||
                'ontouchstart' in window ||
                (window.DocumentTouch && document instanceof window.DocumentTouch)
            );
        })()
    );
}
