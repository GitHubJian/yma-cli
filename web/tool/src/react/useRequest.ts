import {useState, useCallback, useEffect} from 'react';

/**
 * useRequest
 *
 * @param {()=>Promise<any>} httpRequest
 * @typedef {object} config
 * @prop {boolean} manual 是否在 mounted 的时候调用 httpRequest，默认调用
 * @prop {any} defaultParams 初始化调用 httpRequest 的参数
 * @prop {function} callback
 *
 * @returns {object} {}
 */
export default function useRequest<T, S>(
    httpRequest: (params: S) => Promise<T>,
    config: Partial<{
        manual: boolean;
        defaultParams: S;
        callback: (error: null | Error, data: T) => void;
    }> = {},
): {
    loading: boolean;
    data: T;
    error?: Error;
    run: (params: S) => Promise<T>;
} {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<T>({} as T);
    const [error, setError] = useState<Error>();

    const manual = !!config.manual;
    const defaultParams = config.defaultParams || {};
    const callback = useCallback(config.callback || (() => {}), []);

    const run = useCallback(async function (options) {
        setLoading(true);
        setData({} as T);

        let res;
        let err;
        try {
            res = await httpRequest(options);

            if (res.code === '0') {
                setData(res.data);
            } else {
                throw new Error(res.errmsg);
            }
        } catch (e) {
            err = e as Error;
            setError(e as Error);
        }

        setLoading(false);

        callback(err, res);

        return res;
    }, []);

    useEffect(function () {
        if (!manual) {
            run(defaultParams);
        }
    }, []);

    return {
        loading,
        data,
        error,
        run,
    };
}
