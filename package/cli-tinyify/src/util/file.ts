/**
 * @file util/file.js
 * @desc 文件操作
 */

/* eslint-disable no-undef */
import fse from 'fs-extra';
import fs from 'fs';

/**
 * 读取文件
 * @param {string} filepath 文件路径
 * @returns {string | null}
 */
export function readFile(filepath: string): string | null {
    try {
        return fse.readFileSync(filepath, 'utf-8');
    }
    catch (e) {
        // TODO log
        return null;
    }
}

/**
 * 写入文件
 * @param {string} filepath 文件路径
 * @param {string} content UTF8类型文件内容
 */
export function writeFile(filepath: string, content: string): void {
    try {
        fse.writeFileSync(filepath, content, 'utf-8');
    }
    catch (error) {
        // TODO log
    }
}

/**
 * 读取 Image 文件
 * @param {string} filepath 文件路径
 * @returns {Buffer | null}
 */
export function readImageFile(filepath: string): Buffer | null {
    try {
        return fs.readFileSync(filepath);
    }
    catch (e) {
        // TODO log
        return null;
    }
}

/**
 * 写入 Image 文件
 * @param {string} filepath 文件路径
 * @param {Buffer} buffer 二进制文件内容
 */
export function writeImageFile(filepath: string, buffer: Buffer): void {
    try {
        fse.writeFileSync(filepath, buffer);
    }
    catch (error) {
        // TODO log
    }
}
