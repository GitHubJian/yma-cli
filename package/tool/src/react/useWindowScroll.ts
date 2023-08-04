import {useState, useCallback, useLayoutEffect} from 'react';

/**
 * useWindowScroll
 *
 * @desc 窗口滚动，设置滚动位置
 *
 * @returns {[scroll, updateScroll]} scroll 值，更新 scroll 值
 */
export default function useWindowScroll() {
    const [scroll, setScroll] = useState({
        x: 0,
        y: 0,
    });

    const updateScroll = useCallback(function (x: number, y: number) {
        if (typeof x === 'number' && typeof y === 'number') {
            window.scrollTo(x, y);
        } else {
            throw new Error(
                'useWindowScroll 期望传入 (x:number, y:number) 参数'
            );
        }
    }, []);

    useLayoutEffect(function () {
        function handler() {
            setScroll({x: window.pageXOffset, y: window.pageYOffset});
        }

        handler();
        window.addEventListener('scroll', handler);

        return () => {
            window.removeEventListener('scroll', handler);
        };
    }, []);

    return [scroll, updateScroll];
}
