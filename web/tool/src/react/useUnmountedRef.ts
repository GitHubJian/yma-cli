import {useEffect, useRef} from 'react';

// 获取当前组件是否卸载
export default function useUnmountedRef() {
    const ref = useRef(false);

    useEffect(function () {
        ref.current = false;

        return function () {
            ref.current = true;
        };
    }, []);

    return ref;
}
