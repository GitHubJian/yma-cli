/**
 * @file util/merge.js
 * @desc 合并对象
 */
import deepmerge from 'deepmerge';

/**
 * 合并数组
 * @param {Array<unknown>} a
 * @param {Array<unknown>} b
 * @returns {Array<unknown>}
 */
const mergeArrayWithDedupe = (a: unknown[], b: unknown[]) =>
    Array.from(new Set([...a, ...b]));

/**
 * 合并数据
 * @param {Partial<unknown>} x 待合并数据
 * @param {Partial<unknown>} y 待合并数据
 * @returns {unknown}
 */
export function merge<T>(x: T, y: T): T {
    return deepmerge(x, y, {arrayMerge: mergeArrayWithDedupe});
}
