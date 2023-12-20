import {useState, useLayoutEffect} from 'react';

export default function useWindowSize() {
    const [size, setSize] = useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: 0,
    });

    useLayoutEffect(function () {
        function handler() {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        handler();
        window.addEventListener('resize', handler);

        return () => {
            window.removeEventListener('resize', handler);
        };
    }, []);

    return size;
}
