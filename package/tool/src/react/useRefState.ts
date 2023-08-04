import {useEffect, useRef, useState} from 'react';

function useRefState<T>(initialValue: T) {
    const [state, setState] = useState(initialValue);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    return [stateRef.current, setState];
}

export default useRefState;
