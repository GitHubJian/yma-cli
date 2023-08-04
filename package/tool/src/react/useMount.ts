import {useEffect, useRef} from 'react';

export default function useMount<T extends Function>(fn: T) {
    const fnRef = useRef(fn);
    fnRef.current = fn;

    useEffect(function () {
        fnRef.current();
    }, []);
}
