/**
 * @file util/hash.js
 * @desc 生成 hash
 */
import crypto from 'crypto';

/**
 * 生成 MD5 Hash
 * @param {Buffer} source 二进制文件内容
 * @returns
 */
// eslint-disable-next-line no-undef
export function createContentHash(source: Buffer): string {
    const hash = crypto.createHash('md5');
    hash.update(source);

    return hash.digest('hex');
}
