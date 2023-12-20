import {useCallback, useState} from 'react';
import Cookie from '../cookie';

/**
 * useCookie
 *
 * @desc 获取或者设置 Cookie 值
 *
 * @param {string} key
 * @typedef {Object} options
 * @prop {string} expires 有效期
 * @prop {string} path 路径
 * @prop {string} domain 域
 * @prop {boolean} secure 是否安全
 *
 * @returns {string} 返回值
 */
export function useCookie(
    key: string,
    options: {
        domain?: string;
        path?: string;
        expires?: number;
        secure?: boolean;
        defaultValue?: string;
    } = {
        defaultValue: '',
    }
) {
    const [value, setValue] = useState(function () {
        const currentValue = Cookie.get(key);

        if (currentValue) {
            return currentValue;
        }

        return options.defaultValue;
    });

    const updateValue = useCallback(function (newValue, newOptions) {
        // @ts-expect-error
        const {defaultValue, ...restOptions} = {
            ...options,
            ...newOptions,
        };

        setValue(newValue);

        if (newValue === undefined) {
            Cookie.remove(key);
        } else {
            Cookie.set(key, newValue, restOptions);
        }
    }, []);

    return [value, updateValue];
}
