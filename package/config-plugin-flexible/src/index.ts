import PluginAPI, {Chain} from 'yma-config-plugin';
import FlexibleWebpackPlugin from './flexible-webpack-plugin';
import PostCSSPx2RemPlugin from './postcss-px2rem-plugin';

export interface PluginOptions {
    baseUnit: number;
    unitPrecision: number;
}

export default function (
    api: PluginAPI,
    pluginOptions: Partial<PluginOptions> = {}
) {
    api.chainWebpack((chain: Chain) => {
        const plugin = [
            PostCSSPx2RemPlugin({
                baseUnit: pluginOptions.baseUnit || 100,
                unitPrecision: pluginOptions.unitPrecision || 6,
            }),
        ];

        function updateOptions(lang) {
            function applyOptions(rule) {
                rule.use('postcss-loader').tap(function (loaderOptions) {
                    loaderOptions.postcssOptions =
                        loaderOptions.postcssOptions || {};
                    loaderOptions.postcssOptions.plugins =
                        loaderOptions.postcssOptions.plugins || [];

                    loaderOptions.postcssOptions.plugins.push(plugin);

                    return loaderOptions;
                });
            }

            const vueNormalRule = chain.module.rule(lang).oneOf('vue');
            applyOptions(vueNormalRule);
            const normalRule = chain.module.rule(lang).oneOf('normal');
            applyOptions(normalRule);
        }

        updateOptions('css');
        updateOptions('less');

        chain.plugin('flexible').use(FlexibleWebpackPlugin, [
            {
                isUglify: api.isProd,
            },
        ]);
    });
}

export {FlexibleWebpackPlugin};
