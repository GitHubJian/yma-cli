/**
 * @file util/option.js
 * @desc 配置信息
 */
import fs from 'fs';
import {error} from 'yma-shared-util';
import {merge, getRcPath} from './util';

// 全局配置文件
export const rcPath = getRcPath('.tinyifyrc');

interface Options {
    tokens: string[];
    mimes: string[];
}

const defaults = {
    tokens: [],
    mimes: ['image/png', 'image/jpeg'],
};

/**
 * 加载本地配置文件
 * @returns {Options}
 */
export function loadOptions(): Options {
    if (fs.existsSync(rcPath)) {
        try {
            const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
            const options = merge(defaults, rc);

            if (options.tokens?.length === 0) {
                throw 'Not Found Tokens at ~/.tinyifyrc';
            }

            return options;
        } catch (e) {
            error('配置文件异常', 'Tinyify');

            process.exit();
        }
    }

    error('Not Found ~/.tinyifyrc', 'Tinyify');
    process.exit();
}
