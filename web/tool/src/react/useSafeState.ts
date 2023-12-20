import {useCallback, useState} from 'react';
import useUnmountedRef from './useUnmountedRef';

// 使用方法与 useState 的用法完全一致，但在组件卸载后异步回调内的 setState 不再执行
// 这样可以避免因组件卸载后更新状态而导致的内存泄漏
export default function useSafeState<T>(initState: T) {
    const ref = useUnmountedRef();
    const [state, setState] = useState(initState);

    const setCurrentState = useCallback(function (newState: T) {
        if (ref.current) {
            return;
        }

        setState(newState);
    }, []);

    return [state, setCurrentState];
}
