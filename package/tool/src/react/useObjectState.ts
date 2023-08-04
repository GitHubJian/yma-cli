import {useState, useCallback} from 'react';

/**
 * useObjectState
 *
 * @desc 对象级 state 的使用
 *
 * @param {object} initValue
 *
 * @returns {[state, updateState]} [数据, 更新数据]
 */
export default function useObjectState<T extends Object>(initValue: T) {
    const [state, setState] = useState(initValue);

    const updateState = useCallback(function (
        stateOrFn: Partial<T> | ((oldState: T) => T)
    ) {
        if (typeof stateOrFn === 'function') {
            setState(function (oldState: T) {
                const newState = stateOrFn(oldState);

                return {
                    ...oldState,
                    ...newState,
                };
            });
        } else if (typeof stateOrFn === 'object') {
            setState(function (oldState) {
                return {
                    ...oldState,
                    ...stateOrFn,
                };
            });
        }
    },
    []);

    return [state, updateState];
}
