import path from 'path';
import PluginAPI, {Chain} from 'yma-config-plugin';

export default async function (api: PluginAPI) {
    const apply = (chain: Chain) => {
        chain.resolve.extensions.prepend('.ts').prepend('.tsx');

        chain.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'));

        const tsRule = chain.module.rule('ts').test(/\.ts$/);

        tsRule.use('babel-loader').loader(require.resolve('babel-loader'));

        tsRule
            .use('ts-loader')
            .loader(require.resolve('ts-loader'))
            .options({
                transpileOnly: true,
                appendTsSuffixTo: ['\\.vue$'],
                happyPackMode: api.isProd,
            });
    };

    api.chainWebpack(apply);
}
