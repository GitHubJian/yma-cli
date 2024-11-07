import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import {loadOptions} from 'yma-shared-util';
import PluginAPI from '..';
import Chain from '../../chain';
import getAssetPath from '../util/get-asset-path';

// 全局搜索 GLOBAL_BROWSERS_LIST，默认值
const GLOBAL_BROWSERS_LIST = [
    'Chrome >= 46',
    'Firefox >= 45',
    'Safari >= 10',
    'Edge >= 13',
    'iOS >= 10',
    'Electron >= 0.36',
];

const isTiled = process.env.YMA_OUTPUT_TILED == 'true';

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        const shadowMode = false;
        const sourceMap = false;
        const {publicPath, extract = api.isProd, loaderOptions = {}} = api.projectOptions.css || {};

        const shouldExtract = extract !== false && !shadowMode;

        let filename;
        if (isTiled) {
            filename = `[name]${api.projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.css`;
        } else {
            filename = getAssetPath(
                `css/[name]${api.projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.css`,
                api.projectOptions.assetsDir,
            );
        }

        const extractOptions = Object.assign(
            {
                filename,
                chunkFilename: filename,
            },
            extract && typeof extract === 'object' ? extract : {},
        );

        const cssPublicPath = publicPath
            ? publicPath
            : '../'.repeat(extractOptions.filename.replace(/^\.[\/\\]/, '').split(/[\/\\]/g).length - 1);

        const plugins: any[] = [];

        const browsers = loadOptions<string[]>('browserslist.config.js', api.context) || GLOBAL_BROWSERS_LIST;

        plugins.push([
            'postcss-preset-env',
            {
                browsers: browsers,
            },
        ]);

        const postcssOptions = {
            postcssOptions: {
                plugins: plugins,
            },
        };

        function createCSSRule(lang: string, test: RegExp, loader?: string, options: Record<string, any> = {}): void {
            function applyLoaders(rule: Chain.Rule<Chain.Rule<Chain.Module>>) {
                if (shouldExtract) {
                    rule.use('extract-css-loader')
                        .loader(require.resolve('mini-css-extract-plugin/dist/loader.js'))
                        .options({
                            publicPath: cssPublicPath,
                            esModule: false,
                        });
                } else {
                    rule.use('style-loader').loader(require.resolve('style-loader')).options({});
                }

                rule.use('css-loader').loader(require.resolve('css-loader')).options({
                    sourceMap,
                });

                rule.use('postcss-loader').loader(require.resolve('postcss-loader')).options(
                    Object.assign(
                        {
                            sourceMap,
                        },
                        postcssOptions,
                    ),
                );

                if (loader) {
                    let resolvedLoader;
                    try {
                        resolvedLoader = require.resolve(loader);
                    } catch (error) {
                        resolvedLoader = loader;
                    }

                    rule.use(loader).loader(resolvedLoader).options(
                        Object.assign(
                            {
                                sourceMap,
                            },
                            options,
                        ),
                    );
                }
            }

            const baseRule = chain.module.rule(lang).test(test);

            const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/);
            applyLoaders(vueNormalRule);

            const normalRule = baseRule.oneOf('normal');
            applyLoaders(normalRule);
        }

        createCSSRule('css', /\.css$/);

        createCSSRule('scss', /\.scss$/, 'sass-loader', Object.assign({}, loaderOptions.scss || loaderOptions.sass));

        createCSSRule('less', /\.less$/, 'less-loader');

        if (shouldExtract) {
            chain.plugin('extract-css').use(require('mini-css-extract-plugin'), [extractOptions]);

            if (api.isProd) {
                chain.optimization.minimizer('css').use(CssMinimizerPlugin, [
                    // @ts-expect-error
                    {
                        minimizerOptions: {
                            preset: [
                                'default',
                                {
                                    mergeLonghand: false,
                                    cssDeclarationSorter: false,
                                },
                            ],
                        },
                    },
                ]);
            }
        }
    });
}
