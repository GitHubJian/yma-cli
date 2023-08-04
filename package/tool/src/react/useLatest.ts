import {useRef} from 'react';

export default function useLatest<T>(v: T) {
    const ref = useRef(v);
    ref.current = v;

    return ref;
}
