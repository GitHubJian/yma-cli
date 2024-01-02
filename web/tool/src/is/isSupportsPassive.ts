export function isSupportsPassive() {
    let supportsPassive = false;
    try {
        let opts = Object.defineProperty({}, 'passive', {
            get: function get() {
                supportsPassive = true;
            },
        });

        window.addEventListener('testPassiveListener', () => {}, opts);
    } catch (e) {
        // No support
    }

    return supportsPassive;
}
