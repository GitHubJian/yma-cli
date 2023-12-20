import {useState, useEffect, useRef} from 'react';

/**
 * 添加或者设置 Script 的状态
 *
 * @param {string} src
 * @typedef {object} options
 * @prop {boolean} removeOnUnmount 卸载时移除
 *
 * @returns {string} 当前状态 idle | loading
 */
export function useAppendScript(
    src: string,
    options: Partial<{removeOnUnmount: boolean}> = {}
) {
    const [status, setStatus] = useState(() => {
        if (!src) {
            return 'idle';
        }

        return 'loading';
    });

    const statusRef = useRef({});

    useEffect(() => {
        if (!src) {
            return;
        }

        const currentStatus = statusRef.current[src];
        if (currentStatus === 'ready' || currentStatus === 'error') {
            setStatus(currentStatus);
            return;
        }

        let script = document.querySelector(`script[src="${src}"]`);

        if (script) {
            setStatus(script.getAttribute('data-status') || currentStatus);
        } else {
            script = document.createElement('script');
            script.setAttribute('src', src);
            script.setAttribute('async', 'async');
            script.setAttribute('data-status', 'loading');
            document.body.appendChild(script);

            function listener(event) {
                const scriptStatus = event.type === 'load' ? 'ready' : 'error';

                if (script) {
                    script.setAttribute('data-status', scriptStatus);
                }
            }

            script.addEventListener('load', listener);
            script.addEventListener('error', listener);
        }

        const setStateFromEvent = event => {
            const newStatus = event.type === 'load' ? 'ready' : 'error';

            setStatus(newStatus);

            statusRef.current[src] = newStatus;
        };

        script.addEventListener('load', setStateFromEvent);
        script.addEventListener('error', setStateFromEvent);

        return () => {
            if (script) {
                script.removeEventListener('load', setStateFromEvent);
                script.removeEventListener('error', setStateFromEvent);
            }

            if (script && options.removeOnUnmount) {
                script.remove();
            }
        };
    }, [src, options.removeOnUnmount]);

    return status;
}
