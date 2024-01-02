import {useCallback, useEffect, useState} from 'react';

/**
 * useClipboard
 *
 * @desc 剪切板复制
 *
 * @param {any} initValue
 * @param {function} callback 复制成功后的回调
 *
 * @returns {[state, updateState]} [值, 更新值]
 */
export default function useClipboard(initValue: string = '', callback: (val: any) => void = function () {}) {
    const [state, setState] = useState(initValue);
    const cb = useCallback(callback, []);

    let input;
    useEffect(function () {
        input = document.createElement('input');
        input.value = initValue;
        document.body.appendChild(input);

        return function () {
            input.remove();
        };
    }, []);

    const updateState = useCallback(function (val: string) {
        setState(val);

        input.value = val;
        input.select(); // 选择对象
        document.execCommand('Copy'); // 执行浏览器复制命令

        cb(val);
    }, []);

    return [state, updateState];
}
