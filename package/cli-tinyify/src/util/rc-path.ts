/**
 * @file util/rc-path
 * @desc 读取rc文件
 */
import path from 'path';
import os from 'os';

/**
 * 获取 RC 文件绝对路径
 * @param {string} file 文件名
 * @returns {string} 文件路径
 */
export function getRcPath(filename: string): string {
    return path.join(os.homedir(), filename);
}
