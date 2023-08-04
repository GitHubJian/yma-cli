import {useEffect, useRef} from 'react';

export default function useUnmount(fn: () => void) {
    const ref = useRef(fn);
    ref.current = fn;

    useEffect(
        function () {
            return function () {
                ref.current();
            };
        },
        [fn]
    );
}
