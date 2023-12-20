import {useState, useCallback} from 'react';

/**
 * useLocalStroge
 *
 * @desc 获取 localstroge 中的数据
 *
 * @param {string} key 字段
 * @param {any} initialValue 初始值
 *
 * @returns
 */
export function useLocalStroge<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(function () {
        const currentValue = window.localStorage.getItem(key);

        return currentValue ? JSON.parse(currentValue) : initialValue;
    });

    const updateValue = useCallback(function (value: T) {
        window.localStorage.setItem(key, JSON.stringify(value));

        setValue(value);
    }, []);

    return [value, updateValue];
}
