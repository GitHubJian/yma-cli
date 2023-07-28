/**
 * @file util/format.js
 * @desc 格式化数据
 */

/**
 * 格式化文件大小
 * @param {number} size 文件大小
 * @returns {string}
 */
export function formatSize(size: number = 0): string {
    return size < 1024 ? `${size}B` : `${(size / 1024).toFixed(2)}KB`;
}

/**
 * 格式化比率大小
 * @param {number} oldSize 旧大小
 * @param {number} newSize 新大小
 * @returns {string}
 */
export function formatRatio(oldSize: number, newSize: number): string {
    try {
        const radio = (oldSize - newSize) / oldSize;

        return (radio * 100).toFixed(2) + '%';
    } catch (error) {
        return '0%';
    }
}
