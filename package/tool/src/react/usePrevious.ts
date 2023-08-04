import {useEffect, useRef} from 'react';

/**
 * usePrevious
 *
 * @desc 使用最初始的值
 *
 * @param {any} initValue
 *
 * @returns {any} 值
 */
export default function usePrevious<T>(initValue: T) {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = initValue;
    });

    return ref.current;
}
