/**
 * @file util/print.js
 * @desc 打印控制台日志
 */
/* eslint-disable no-console */
import Table from 'cli-table';
import {formatRatio, formatSize} from './format';
import {Repeated, Result} from '../main';
import chalk from 'chalk';

type Method = 'log' | 'table';

/**
 * 输出控制台信息
 * @param {string} message 日志信息
 * @param {Method} method 控制台方法
 */
export function print(message: string, method: Method = 'log'): void {
    console[method](message);
}

/**
 * 对象key进行排序
 * @param {Record<string, unknown>} obj 对象
 * @param {string[]} keyOrder key数组
 * @param {boolean} dontSortByUnicode 是否通过 unicode 排序
 * @returns {Record<string, unknown>}
 */
function sortObject(
    obj: Record<string, unknown>,
    keyOrder?: string[],
    dontSortByUnicode?: boolean,
): Record<string, any> {
    const res = {};
    if (keyOrder) {
        keyOrder.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                res[key] = obj[key];
                delete obj[key];
            }
        });
    }

    const keys = Object.keys(obj);

    !dontSortByUnicode && keys.sort();
    keys.forEach(key => {
        res[key] = obj[key];
    });

    return res;
}

const MAX_LIMIT_SIZE = 1024 * 1024;
/**
 * 打印已经被压缩的图片信息
 * @param {Result[]} results 信息
 * @param {number} maxLimitSize 最大值
 */
export function printTinyify(results: Result[], maxLimitSize: number = MAX_LIMIT_SIZE): void {
    const table = new Table({
        head: ['file path', 'old size', 'new size', 'ratio', 'error', 'repeated'].map(function (msg) {
            return chalk.green(msg);
        }),
    });

    results.forEach(function (res) {
        const oldSize = res.source.byteLength || 1;
        const newSize = res.data.byteLength || 0;

        table.push(
            Object.values(
                sortObject(
                    {
                        input: res.error || res.repeated ? chalk.red(res.input) : res.input,
                        oldSize: formatSize(oldSize),
                        newSize: newSize > maxLimitSize ? chalk.red(formatSize(newSize)) : formatSize(newSize),
                        ratio: formatRatio(oldSize, newSize),
                        error: !!res.error,
                        repeated: res.repeated || '',
                    },
                    ['input', 'oldSize', 'newSize', 'ratio', 'error', 'repeated'],
                ),
            ),
        );
    });

    print(table.toString());
}

/**
 * 打印冲虚图片信息
 * @param {Repeated[]} repeateds 信息
 */
export function printRepeated(repeateds: Repeated[]): void {
    const table = new Table({
        colAligns: ['left', 'center', 'left'],
        head: ['source path', 'to', 'target path'].map(function (msg) {
            return chalk.green(msg);
        }),
    });

    repeateds.forEach(function (repeated) {
        table.push([repeated.input, '→', repeated.repeated]);
    });

    print(table.toString());

    return;
}
