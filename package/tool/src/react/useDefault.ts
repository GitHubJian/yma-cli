import {useState} from 'react';

/**
 * useDefault
 *
 * @desc 使用默认值
 *
 * @param {any} initialValue
 * @param {any} defaultValue
 * @returns {[value, setValue]} [值, 设置值]
 */
export default function useDefault<T>(initialValue: T, defaultValue: T) {
    const [value, setValue] = useState(initialValue);

    if (value === undefined || value === null) {
        return [defaultValue, setValue];
    }

    return [value, setValue];
}
