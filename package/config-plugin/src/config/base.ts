import {DefinePlugin} from 'webpack';
import CaseSensitivePathsWebpackPlugin from 'case-sensitive-paths-webpack-plugin';
import FriendlyErrorsWebpackPlugin from '@soda/friendly-errors-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';

import Chain from '../../chain';
import PluginAPI from '..';
import resolveLocal from '../util/resolve-local';
import resolveClientEnv from '../util/resolve-client-env';

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        chain
            .mode(api.mode)
            .context(api.context)
            .output.path(api.resolve(api.projectOptions.outputDir))
            .publicPath(api.projectOptions.publicPath);

        chain.resolve.extensions
            .merge(['.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'])
            .end()
            .modules.add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'))
            .end()
            .alias.set('@', api.resolve('src'));

        chain.resolveLoader.modules
            .add('node_modules')
            .add(api.resolve('node_modules'))
            .add(resolveLocal('node_modules'));

        chain.module.noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/);

        chain.resolve.alias.set('vue$', 'vue/dist/vue.esm.js');

        chain.module
            .rule('vue')
            .test(/\.vue$/)
            .use('vue-loader')
            .loader(require.resolve('vue-loader'))
            .options({
                compilerOptions: {
                    whitespace: 'condense',
                },
            });

        chain.plugin('vue-loader').use(require('vue-loader').VueLoaderPlugin);

        chain.plugin('define').use(DefinePlugin, [resolveClientEnv(api.projectOptions)]);

        chain.plugin('case-sensitive-paths').use(CaseSensitivePathsWebpackPlugin);

        chain.plugin('friendly-errors').use(FriendlyErrorsWebpackPlugin);

        chain.optimization.minimizer('terser').use(TerserWebpackPlugin, [
            // @ts-expect-error
            {
                extractComments: false,
            },
        ]);
    });
}
