import {useRef} from 'react';

/**
 * useMemoFn
 *
 * @desc memo function
 *
 * @param {function} fn
 *
 * @returns {function}
 */
export default function useMemoFn(fn) {
    const fnRef = useRef(fn);
    fnRef.current = useMemoFn(() => fn, [fn]);
    const memoFn = useRef();

    if (!memoFn.current) {
        memoFn.current = function (ctx, ...args) {
            return fnRef.current.apply(ctx, args);
        };
    }

    return memoFn.current;
}
