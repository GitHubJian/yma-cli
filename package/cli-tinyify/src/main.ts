/**
 * @file index.js
 * @desc 压缩
 */

/* eslint-disable no-undef */
import path from 'path';
import tinify from 'tinify';
import glob from 'glob';
import ProgressBar from 'progress';
import mime from 'mime-types';
import {error, done, info, log} from 'yma-shared-util';
import {
    CachedFileInfo,
    ExcludeFileInfo,
    Cached,
    loadCache,
    writeImageFile,
    readImageFile,
    printTinyify,
    print,
    createContentHash,
    merge,
    saveCache,
    printRepeated,
} from './util';
import {loadOptions} from './option';

const VALIDATE_SUCCESS_CODE = 0;
const VALIDATE_FAIL_CODE = 1;
const TOKEN_MAX_LIMIT = 500;

export interface Repeated {
    input: string;
    repeated: string;
}

export interface Filted {
    input: string;
    source: Buffer;
    oldHash: string;
}

interface FilterReturns {
    repeateds: Repeated[];
    filteds: Filted[];
}

/**
 * 分组筛选符合规范的图片信息
 * @param {string[]} inputs 待压缩的图片链接
 * @param {Cached | null} cached 已经压缩过的图片信息
 * @param {string} cwd 运行时目录
 * @returns {FilterReturns}
 */
function filter(inputs: string[], cached: Cached | null, cwd: string): FilterReturns {
    const repeateds: Repeated[] = [];
    const filteds: Filted[] = [];

    if (!cached) {
        inputs.forEach(function (input) {
            const source = readImageFile(input) as Buffer;
            const oldHash = createContentHash(source);

            filteds.push({
                input: input,
                source: source,
                oldHash: oldHash,
            });
        });

        return {
            repeateds: [],
            filteds: filteds,
        };
    }

    inputs.forEach(function (input) {
        const source = readImageFile(input) as Buffer;
        const oldHash = createContentHash(source);

        const isCached =
            (cached.list || []).find(function (fileinfo: CachedFileInfo) {
                return fileinfo.newHash === oldHash || fileinfo.oldHash === oldHash;
            }) ||
            (cached.exclude || []).find(function (fileinfo: ExcludeFileInfo) {
                return fileinfo.oldHash === oldHash;
            });

        if (isCached) {
            const currentInput = input.replace(cwd, '');
            const existedInput = isCached.input;

            if (currentInput !== existedInput) {
                repeateds.push({
                    input: currentInput, // absoulte
                    repeated: existedInput,
                });
            }
        } else {
            filteds.push({
                input: input,
                source: source,
                oldHash: oldHash,
            });
        }
    });

    return {
        repeateds,
        filteds,
    };
}

/**
 * 获取分组
 * @param {Filted[]} filteds 整体数组
 * @param {number} start 起始位置
 * @param {number} length 长度
 * @returns {Filted[]}
 */
function getCurrentFilteds(filteds: Filted[], start: number, length: number): Filted[] {
    return filteds.slice(start, start + length);
}

type ValidTokenReturns = Promise<{
    code: number;
    compressionCount: number;
}>;
/**
 * 验证token是否可用
 * @returns {ValidTokenReturns}
 */
function validToken(): ValidTokenReturns {
    return new Promise(resolve => {
        tinify.validate(function (err) {
            if (err) {
                resolve({
                    code: VALIDATE_FAIL_CODE,
                    compressionCount: TOKEN_MAX_LIMIT,
                });
            } else {
                resolve({
                    code: VALIDATE_SUCCESS_CODE,
                    compressionCount: tinify.compressionCount as number,
                });
            }
        });
    });
}

interface TokenGroup {
    token: string;
    filteds: Filted[];
}

/**
 * 将token与待处理图片进行分组
 * @param {string[]} tokens tokens 信息
 * @param {Filted[]} filteds 待处理图片信息
 * @returns {Promise<TokenGroup[]>}
 */
async function createTokenGroups(tokens: string[], filteds: Filted[]): Promise<TokenGroup[]> {
    let idx = 0;
    let pos = 0;
    const tokenGroups: TokenGroup[] = [];

    while (pos < filteds.length && idx < tokens.length) {
        const token = tokens[idx];
        tinify.key = token;
        const {code, compressionCount} = await validToken();
        if (code === VALIDATE_SUCCESS_CODE && compressionCount < TOKEN_MAX_LIMIT) {
            const restCount = TOKEN_MAX_LIMIT - compressionCount;
            const currentFilteds = getCurrentFilteds(filteds, pos, TOKEN_MAX_LIMIT - compressionCount);

            pos += restCount;

            tokenGroups.push({
                token,
                filteds: currentFilteds,
            });
        }

        idx++;
    }

    if (pos < filteds.length) {
        // token 不够用
    }

    return tokenGroups;
}

function _upload(input: string, token: string) {
    tinify.key = token;

    const source = tinify.fromFile(input);

    return source.toBuffer();
}

type UploadReturns = Promise<{input: string; data: Uint8Array; error?: Error}>;
/**
 * 上传图片
 * @param {string} input 图片绝对路径
 * @param {string} token token
 * @param {number} retry 重试次数
 * @returns {UploadReturns}
 */
async function upload(input: string, token: string, retry: number = 3): UploadReturns {
    let retryCount = 0;
    let data;
    let error;

    while (retryCount < retry) {
        try {
            data = await _upload(input, token);
            break;
        } catch (e) {
            error = e;
            retryCount++;
        }
    }

    return {
        input,
        data,
        error,
    };
}

export interface Result {
    input: string;
    source: Buffer; // eslint-disable-line no-undef
    oldHash: string;
    newHash: string;
    data: Uint8Array;
    error?: Error;
    repeated?: string;
}

/**
 * Uint8Array 转 String
 * @param {Uint8Array} u8a 数据
 * @returns {string}
 */
function Uint8ArrayToStr(u8a: Uint8Array): string {
    let str = '';
    for (const v of u8a) {
        str += String.fromCharCode(u8a[v]);
    }

    return str;
}

/**
 * 生成图片
 * @param {Result[]} results
 * @param {string} cwd
 */
function write(results: Result[], cwd: string) {
    for (let i = 0, len = results.length; i < len; i++) {
        const result = results[i];

        if (!result.error && !result.repeated) {
            const buffer = Buffer.from(result.data);

            writeImageFile(`${cwd}${result.input}`, buffer);
        }
    }
}

/**
 * 写入缓存
 * @param {string} filepath 缓存文件信息
 * @param { Result[]} results 压缩结果
 * @param {Cached} cached 缓存文件信息
 */
function writeCached(filepath: string, results: Result[], cached: Cached | null) {
    const list: CachedFileInfo[] = [];
    const exclude: ExcludeFileInfo[] = [];

    results.forEach(function (result) {
        if (result.error) {
            exclude.push({
                input: result.input,
                oldHash: result.oldHash, // 存储原文件 hash
            });
        } else if (!result.error && !result.repeated) {
            list.push({
                input: result.input, // 存储原文件 hash
                oldHash: result.oldHash,
                newHash: result.newHash, // 存储被压缩后文件 hash
                data: Uint8ArrayToStr(result.data),
            });
        }
    });

    const value: Cached = {
        list,
        exclude,
    };

    const toSave = merge<Cached>(cached || {}, value);

    saveCache(filepath, toSave);
}

interface TinyifyOptions {
    cwd: string;
}

/**
 * 压缩
 * @param {string[]} allInputs 待处理图片绝对路径
 * @param {Options} opts 配置信息
 */
export async function tinyify(allInputs: string[], tokens: string[], opts: TinyifyOptions): Promise<void> {
    const cwd = opts.cwd;
    info('Checking', 'Tinyify');
    log(cwd);
    log('');

    let bar;
    const cachepath = path.resolve(cwd, 'config', 'tinyify-config.json');
    const cached = loadCache(cachepath);
    const {filteds, repeateds} = filter(allInputs, cached, cwd);

    if (filteds.length > 0) {
        bar = new ProgressBar('[:bar] :current/:total :percent', {
            total: filteds.length,
            width: 40,
        });

        bar.render();

        const tokenGroups = await createTokenGroups(tokens, filteds);

        let idx = 0;
        const results: Result[] = [];

        while (idx < tokenGroups.length) {
            let pos = 0;
            const token = tokenGroups[idx].token;
            const filteds = tokenGroups[idx].filteds;
            while (pos < filteds.length) {
                const filted = filteds[pos];
                const uploaded = results.find(function (result) {
                    return result.oldHash === filted.oldHash || result.newHash === filted.oldHash;
                });

                if (uploaded) {
                    results.push({
                        ...uploaded,
                        input: filted.input.replace(cwd, ''),
                        repeated: uploaded.input,
                    });
                } else {
                    const result = await upload(filted.input, token);

                    results.push({
                        input: result.input.replace(cwd, ''),
                        data: result.data,
                        error: result.error,
                        source: filted.source,
                        oldHash: filted.oldHash,
                        newHash: createContentHash(Buffer.from(result.data)),
                    });
                }

                pos++;

                if (bar) {
                    bar.tick();
                }
            }

            idx++;
        }

        print('');

        done('本次压缩文件：', 'Tinyify');
        printTinyify(results);

        write(results, cwd);

        writeCached(cachepath, results, cached);
    } else if (repeateds.length > 0) {
        print('');

        error('输出重复文件：', 'Tinyify');

        printRepeated(repeateds);
    } else {
        done('Not Found', 'Tinyify');
    }

    return;
}

interface CLIOptions {
    cwd: string;
    folders: string[];
}
/**
 * main
 * @param {Options} opts 配置信息
 */
export default async function main(cliOpts: CLIOptions): Promise<void> {
    const options = loadOptions();
    const mimes = options.mimes;

    const cwd = cliOpts.cwd;
    const folders = cliOpts.folders;
    const inputs: string[] = folders
        .map(folder => {
            const absoultePath = path.resolve(cwd, folder);
            const pattern = `${absoultePath}/**`;
            const allFilePaths = glob.sync(pattern, {
                dot: true,
                nodir: true,
                ignore: ['**/node_modules/**', '**/coverage/**'],
            });

            const expectedFilePaths = allFilePaths.filter((p: string): boolean => {
                return mimes.includes(mime.contentType(path.basename(p)));
            });

            return expectedFilePaths;
        })
        .reduce((prev: string[], cur: string[]) => {
            prev = prev.concat(cur);

            return prev;
        }, [] as string[]);

    tinyify(inputs, options.tokens, {cwd});

    return;
}
