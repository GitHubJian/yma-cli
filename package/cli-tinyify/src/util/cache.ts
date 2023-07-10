/**
 * @file util/cache.js
 * @desc 操作 CacheFile
 */
import fse from 'fs-extra';

interface BaseFileInfo {
    input: string;
    oldHash: string;
}

export interface CachedFileInfo extends BaseFileInfo {
    data: string;
    newHash: string;
}

export type ExcludeFileInfo = BaseFileInfo;

export interface Cached {
    list?: CachedFileInfo[];
    exclude?: ExcludeFileInfo[];
}

/**
 * 加载缓存文件
 * @param {string} filepath 文件路径
 * @returns {Cached | null}
 */
export function loadCache(filepath: string): Cached | null {
    try {
        return fse.readJsonSync(filepath) as Cached;
    }
    catch (e) {
        // TODO log
        return null;
    }
}

/**
 * 存储缓存文件
 * @param {string} filepath 文件路径
 * @param {Cached} cached 待缓存数据
 * @returns {Cached | null}
 */
export function saveCache(filepath: string, cached: Cached): void {
    try {
        fse.writeJsonSync(filepath, cached, 'utf-8');
    }
    catch (error) {
        // TODO log
    }
}
