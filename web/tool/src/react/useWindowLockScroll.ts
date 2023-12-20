import {useCallback, useEffect, useState} from 'react';

/**
 * useWindowLockScroll
 *
 * @desc 锁定 EL 不在触发滚动
 *
 * @param {HTMLElement} el
 *
 * @return {[lock, updateLock]} [锁状态, 更新锁状态]
 */
export default function useWindowLockScroll(el: HTMLElement) {
    const [lock, setLock] = useState(false);

    let rawOverflow;
    useEffect(function () {
        rawOverflow = window.getComputedStyle(el).overflow;

        setLock(rawOverflow === 'hidden');

        return function () {
            el.style.overflow = rawOverflow;
        };
    }, []);

    const updateLock = useCallback(function (locked: boolean) {
        setLock(locked);

        el.style.overflow = locked ? 'hidden' : rawOverflow;
    }, []);

    return [lock, updateLock];
}
