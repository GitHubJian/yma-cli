import {useCallback, useRef} from 'react';

/**
 * useLockFn
 *
 * @desc 函数锁，同一时间函数只能执行一次
 *
 * @param {function} fn
 *
 * @returns
 */
export function useLockFn<T extends Function>(fn: T) {
    const lockRef = useRef(false);

    const cb = useCallback(
        async function (...args) {
            if (lockRef.current) {
                return;
            }

            lockRef.current = true;

            const ret = await fn(...args);

            lockRef.current = false;

            return ret;
        },
        [fn]
    );

    return cb;
}
