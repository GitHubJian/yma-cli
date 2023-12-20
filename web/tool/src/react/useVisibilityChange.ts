import {useState, useEffect} from 'react';

/**
 * useVisibilityChange
 *
 * @desc 获取当前 doc 的展示与隐藏状态
 *
 * @returns {boolean} 当前 doc 的展示与隐藏状态
 */

export function useVisibilityChange() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        function handler() {
            if (document.visibilityState !== 'visible') {
                setVisible(false);
            } else {
                setVisible(true);
            }
        }

        document.addEventListener('visibilitychange', handler);

        return () => {
            document.removeEventListener('visibilitychange', handler);
        };
    }, []);

    return visible;
}
