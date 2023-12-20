import {useRef, useState} from 'react';
import qs from '../qs';

/**
 * useSearchParam
 *
 * @desc 从 URL 中获取参数
 *
 * @returns {[state]} 返回 search param
 */
export default function useSearchParams(): Record<string, any> {
    const urlSearchParams = qs.parse(window.location.search);

    const ref = useRef({});
    ref.current = urlSearchParams;

    return ref.current;
}
