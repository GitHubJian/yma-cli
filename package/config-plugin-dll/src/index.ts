import path from 'path';
import {DllPlugin, DllReferencePlugin} from 'webpack';
import WebpackAPI, {Chain} from 'yma-config-plugin';
import HtmlWebpackTagsPlugin from 'html-webpack-tags-plugin';
import AssetsWebpackPlugin from 'assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

function getAssetPath(filePath: string, assetsDir?: string): string {
    return assetsDir ? path.posix.join(assetsDir, filePath) : filePath;
}

interface DllOptions {
    context?: string;
    entries: {
        [key: string]: string | string[];
    };
    outputDir?: '';
}

export interface PluginOptions {
    patterns: DllOptions | DllOptions[];
    isDll?: boolean;
}
// TODO DLL 模式必须存在 page & context 选项，减少不必要的配置集
// reference name & config 。。。。。。。。。
const DLL_ASSETS_FILENAME = 'dll-assets-manifest.json';

export default function (api: WebpackAPI, pluginOptions: PluginOptions) {
    const patterns = Array.isArray(pluginOptions.patterns)
        ? pluginOptions.patterns
        : [pluginOptions.patterns];

    const apply = (chain: Chain) => {
        // 打包 DLL
        if (pluginOptions.isDll) {
            const pattern = patterns[0];
            const outputDir = api.resolve(
                pattern.outputDir || api.projectOptions.outputDir
            );

            api.projectOptions.outputDir = outputDir;

            const outputFilename = getAssetPath(
                `js/[name]-dll${
                    api.isProd && api.projectOptions.filenameHashing
                        ? '.[contenthash:8]'
                        : ''
                }.js`,
                api.projectOptions.assetsDir
            );

            chain.output.path(outputDir).filename(outputFilename);

            chain.output.delete('chunkFilename');

            const LIBRARY_NAME = '[name]_dll_[fullhash]';

            chain.output.library(LIBRARY_NAME);

            const dllpath = path.resolve(outputDir, '[name].manifest.json');

            chain.plugin('dll').use(DllPlugin, [
                {
                    context: api.context,
                    format: true,
                    path: dllpath,
                    name: LIBRARY_NAME,
                },
            ]);

            chain.plugin('assets-plugins').use(AssetsWebpackPlugin, [
                {
                    path: outputDir,
                    filename: DLL_ASSETS_FILENAME,
                    prettyPrint: true,
                },
            ]);
        }
        else {
            patterns.forEach(function (pattern) {
                const outputDir = path.resolve(
                    pattern.context || api.context,
                    pattern.outputDir || 'dist'
                );

                Object.keys(pattern.entries).forEach(function (entry) {
                    const manifest = path.resolve(
                        outputDir,
                        `${entry}.manifest.json`
                    );

                    chain
                        .plugin(`dll-reference-${entry}`)
                        .use(DllReferencePlugin, [
                            {
                                context: api.context,
                                manifest: require(manifest),
                            },
                        ]);
                });
            });
        }
    };

    apply.post = (chain: Chain) => {
        if (pluginOptions.isDll) {
            chain.entryPoints.clear();

            patterns.forEach(function (pattern) {
                const entries = pattern.entries;

                Object.entries(entries).forEach(function ([entry, value]) {
                    const entryPoint = chain.entry(entry);

                    value = Array.isArray(value) ? value : [value];
                    value.forEach(v => {
                        entryPoint.add(v);
                    });
                });
            });
            // @ts-ignore-next-line
            const pluginKeys = chain.plugins.store.keys();
            for (let key of pluginKeys) {
                if (key.startsWith('html')) {
                    chain.plugins.delete(key);
                }
            }

            chain.optimization.clear();
        }
        else {
            patterns.forEach(function (pattern) {
                const outputDir = path.resolve(
                    pattern.context || api.context,
                    pattern.outputDir || 'dist'
                );

                let assetsJSON = {};
                try {
                    assetsJSON = require(path.resolve(
                        outputDir,
                        DLL_ASSETS_FILENAME
                    ));
                }
                catch (e) {}
                let tags: string[] = [];
                Object.entries(assetsJSON).forEach(function ([entry, value]) {
                    const paths = Object.values(
                        value as Record<string, string>
                    );
                    tags = tags.concat(paths);
                });
                if (tags.length > 0) {
                    chain
                        .plugin('html-webpack-tags-plugin')
                        .use(HtmlWebpackTagsPlugin, [
                            {
                                tags,
                                append: false,
                                usePublicPath: false,
                            },
                        ]);

                    const copyPluginPatterns = tags.map(function (value) {
                        const pattern = {
                            from: path.join(outputDir, value),
                            to: path.join(
                                api.resolve(api.projectOptions.outputDir),
                                value
                            ),
                        };

                        return pattern;
                    });

                    chain.plugin('assets-copy-plugin').use(CopyWebpackPlugin, [
                        {
                            patterns: copyPluginPatterns,
                        },
                    ]);
                }
            });
        }
    };

    api.chainWebpack(apply);
}
