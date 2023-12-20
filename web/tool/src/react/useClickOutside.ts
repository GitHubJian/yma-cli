import {useRef, useEffect} from 'react';

/**
 * useClickOutside
 *
 * @desc 点击元素之外，触发 callback 函数
 *
 * @param {HTMLElement} el
 * @param {function} callback
 *
 * @returns {[ref]}
 */
export default function useClickOutside(
    el: HTMLElement,
    callback: (event: Event) => void
) {
    const ref = useRef(el);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        function handler(event) {
            const el = ref.current;

            if (el && !el.contains(event.target)) {
                callbackRef.current(event);
            }
        }

        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);

        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, []);

    return [ref];
}
