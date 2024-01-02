import {useEffect, useRef, useState} from 'react';

/**
 * useFocusWithin
 *
 * @desc 当前元素是否获取焦点
 *
 * @param {string} selector 选择器
 * @typedef {object} options
 * @prop {boolea} capture
 * @prop {boolea} once
 * @prop {boolea} passive
 *
 * @returns {boolean}
 */
export default function useFocusWithin(selector, options) {
    const [isFocusWithin, setIsFocusWithin] = useState(false);

    const {onFocus, onBlur, onChange} = options;

    function useEventListener(
        eventName: string,
        eventHandler: (e: Event) => void,
        options: Partial<{
            capture: boolean;
            once: boolean;
            passive: boolean;
        }> & {selector: string},
    ) {
        const eventHandlerRef = useRef(eventHandler);
        eventHandlerRef.current = eventHandler;

        useEffect(
            function () {
                const targetElement = document.querySelector(options.selector);

                const eventListener = (e: Event) => {
                    eventHandlerRef.current!(e);
                };

                targetElement?.addEventListener(eventName, eventListener, {
                    capture: options.capture,
                    once: options.once,
                    passive: options.passive,
                });

                return () => {
                    targetElement?.removeEventListener(eventName, eventListener, {
                        capture: options.capture,
                    });
                };
            },
            [options.capture, options.once, options.passive],
        );
    }

    useEventListener(
        'focusin',
        e => {
            if (!isFocusWithin) {
                onFocus && onFocus(e);
                onChange && onChange(true);
                setIsFocusWithin(true);
            }
        },
        {
            selector,
        },
    );

    useEventListener(
        'focusout',
        e => {
            if (isFocusWithin) {
                onBlur && onBlur(e);
                onChange && onChange(false);
                setIsFocusWithin(false);
            }
        },
        {
            selector,
        },
    );

    return [isFocusWithin];
}
