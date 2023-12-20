import {useCallback, useEffect} from 'react';

/**
 * useWindowBeforeUnload
 *
 * @desc 卸载前触发函数
 *
 * @param {string} message 消息
 */
export default function useWindowBeforeUnload(message: string) {
    const handler = useCallback(
        function (event) {
            event.preventDefault();

            if (message) {
                event.returnValue = message;
            }

            return message;
        },
        [message]
    );

    useEffect(() => {
        window.addEventListener('beforeunload', handler);

        return function () {
            window.removeEventListener('beforeunload', handler);
        };
    }, [handler]);
}
