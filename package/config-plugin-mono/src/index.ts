import path from 'path';
import {DllPlugin, DllReferencePlugin} from 'webpack';
import uniqby from 'lodash.uniqby';
import PluginAPI, {Chain} from 'yma-config-plugin';
import HtmlWebpackTagsPlugin from 'html-webpack-tags-plugin';
import AssetsWebpackPlugin from 'assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import {resolvePkg, error, exit} from 'yma-shared-util';

type PackageJSON = {
    monoCommon: boolean;
    monoDependencies: {
        [key: string]: string;
    };
};

export function resolveMonoDependencies(context): Array<[string, string]> {
    const pkg = resolvePkg<PackageJSON>(context);
    const {monoDependencies} = pkg as PackageJSON;

    let alias: Array<[string, string]> = [];

    Object.entries(monoDependencies || {}).forEach(function ([key, value]) {
        const dependencyContext = path.resolve(context, value);

        alias = alias.concat([[key, dependencyContext]]);

        const dependencyAlias = resolveMonoDependencies(dependencyContext);

        alias = alias.concat(dependencyAlias);
    });

    const result = uniqby(alias, function (item) {
        return item[0];
    });

    return result;
}

function resolveMonoManifest(dependenciesContext) {
    const patternMap = new Map<
        string,
        {
            entry: string;
            context: string;
            manifest: string;
        }
    >();

    for (const context of dependenciesContext) {
        const ymaConfigPath = path.resolve(context, 'yma.config.js');
        const ymaConfig = require(ymaConfigPath);
        const enties = Object.keys(ymaConfig.page);
        const outputDir = path.resolve(context, ymaConfig.outputDir || 'dist');

        enties.forEach(function (entry) {
            const manifest = path.resolve(outputDir, `${entry}.manifest.json`);

            if (patternMap.has(entry)) {
                const cachePattern = patternMap.get(entry)!;
                error(
                    `存在重复 Entry(${entry}) at contexts\nlocation at:\n${cachePattern.context}\n${context})`,
                    '[Config Plugin Mono]'
                );

                exit(0);
            }

            patternMap.set(entry, {
                entry: entry,
                context: context,
                manifest: manifest,
            });
        });
    }

    return patternMap;
}

function getAssetPath(filePath: string, assetsDir?: string): string {
    return assetsDir ? path.posix.join(assetsDir, filePath) : filePath;
}

const DLL_ASSETS_FILENAME = 'dll-assets-manifest.json';

export interface Options {
    common: boolean;
}

export default async function (api: PluginAPI, options: Partial<Options> = {}) {
    const pkg = resolvePkg<PackageJSON>(api.context) as PackageJSON;
    const isMono = options.common || pkg.monoCommon;

    if (isMono) {
        api.chainWebpack((chain: Chain) => {
            const outputDir =
                api.projectOptions.outputDir || api.resolve('dist');

            const outputFilename = getAssetPath(
                `js/[name]-dll${
                    api.isProd && api.projectOptions.filenameHashing
                        ? '.[contenthash:8]'
                        : ''
                }.js`,
                api.projectOptions.assetsDir
            );
            chain.output.filename(outputFilename);
            chain.output.delete('chunkFilename');

            const LIBRARY_NAME = '[name]_dll_[fullhash]';

            chain.output.library(LIBRARY_NAME);

            const manifestPath = path.resolve(
                outputDir,
                '[name].manifest.json'
            );

            chain.plugin('dll').use(DllPlugin, [
                {
                    context: api.context,
                    format: true,
                    path: manifestPath,
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
        });

        const apply = (chain: Chain) => {
            // @ts-expect-error
            const pluginKeys = chain.plugins.store.keys();
            for (let key of pluginKeys) {
                if (key.startsWith('html')) {
                    chain.plugins.delete(key);
                }
            }
        };

        apply.enforce = 'post' as 'post' | 'pre' | undefined;

        api.chainWebpack(apply);
    } else {
        const monoDependenciesAlias = resolveMonoDependencies(api.context);
        const monoDependenciesContext = monoDependenciesAlias.map(function ([
            key,
            value,
        ]) {
            return value;
        });

        const patternMap = resolveMonoManifest(monoDependenciesContext);

        api.chainWebpack((chain: Chain) => {
            // monoDependenciesAlias.forEach(([key, value]) => {
            //     chain.resolveLoader.modules.add(
            //         path.resolve(value, 'node_modules')
            //     );
            //     chain.resolve.alias.set(key, value);
            // });

            if (api.isProd) {
                patternMap.forEach(function (pattern) {
                    chain
                        .plugin(`dll-reference-${pattern.entry}`)
                        .use(DllReferencePlugin, [
                            {
                                context: pattern.context,
                                manifest: pattern.manifest,
                            },
                        ]);
                });
            }
        });
    }
}
