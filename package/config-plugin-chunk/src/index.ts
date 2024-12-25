import path from 'path';
import PluginAPI, {Chain, findEntry, EntryType} from 'yma-config-plugin';
import {error} from 'yma-shared-util';

const MAX_GROUP_LENGTH = 3;

function createChunks(
    context: string,
    libs: {[key: string]: string},
): Record<
    string,
    {
        name: string;
        test: ({context}: {context: string}) => boolean;
        reuseExistingChunk: true;
        minChunks: 1;
        priority: -5;
    }
> {
    const chunks = {};

    Object.keys(libs).forEach(function (name) {
        const libPath = libs[name];
        const chunkDirname = path.dirname(path.resolve(context, libPath));
        // TODO name 唯一性
        chunks[name] = {
            name: name,
            test: function (module: {resource: string}): boolean {
                return module?.resource?.includes(chunkDirname);
            },
            reuseExistingChunk: true,
            minChunks: 1,
            priority: 10,
        };
    });

    return chunks;
}

export interface Options {
    autarkies: string[];
}

export default function (api: PluginAPI, options: Partial<Options> = {}) {
    api.chainWebpack((chain: Chain) => {
        if (api.isProd) {
            const libs = findEntry(api.context, EntryType.LIB);

            if (Object.keys(libs).length > MAX_GROUP_LENGTH) {
                error(`lib 最多只能存在 ${MAX_GROUP_LENGTH}`, '[Plugin Chunk]');
            }

            const cacheGroups = createChunks(api.context, libs);
            const autarkies = options.autarkies || [];

            const vendorsOptions = {
                exclude: [api.resolve('./src/lib'), ...autarkies],
                include: ['node_modules'], // 引入
            };

            const autarkiesOptions = {
                exclude: [],
                include: autarkies,
            };

            let splitChunksOptions = {
                minSize: 1,
                maxAsyncRequests: 4,
                maxInitialRequests: 4,
                chunks: 'all',
                cacheGroups: {
                    vendors: {
                        name: 'vendors',
                        test: function (module) {
                            return (
                                vendorsOptions.exclude.every(function (v) {
                                    return module?.resource?.indexOf(v) === -1;
                                }) &&
                                vendorsOptions.include.some(function (v) {
                                    return module?.resource?.indexOf(v) > -1;
                                })
                            );
                        },
                        priority: 10,
                        minChunks: 1,
                        reuseExistingChunk: true,
                    },
                    autarkies: {
                        name: 'autarkies', // 注: 避免 lib 目录下存在 common 重名
                        test: function (module) {
                            return (
                                autarkiesOptions.exclude.every(function (v) {
                                    return module?.resource?.indexOf(v) === -1;
                                }) &&
                                autarkiesOptions.include.some(function (v) {
                                    return module?.resource?.indexOf(v) > -1;
                                })
                            );
                        },
                        priority: 10,
                        minChunks: 1,
                        reuseExistingChunk: true,
                    },
                    ...cacheGroups,
                },
            };

            chain.optimization.splitChunks(splitChunksOptions);
        }
    });
}
