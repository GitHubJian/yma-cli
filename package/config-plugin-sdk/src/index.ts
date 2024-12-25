import PluginAPI, {Chain} from 'yma-config-plugin';
import {resolvePkg} from 'yma-shared-util';

export interface PluginOptions {
    name: string;
    default: boolean;
    filetype: false | 'hash' | 'min';
}

export default function (api: PluginAPI, pluginOptions: Partial<PluginOptions> = {}) {
    const pkg = resolvePkg<{name: string}>(api.context) as {name: string};
    const name = pluginOptions.name || pkg.name;

    api.chainWebpack((chain: Chain) => {
        const filename = `[name]${api.isProd && api.projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.js`;

        chain.output.filename(filename).chunkFilename(filename).library(name).libraryTarget('umd');

        if (pluginOptions.default) {
            chain.output.libraryExport('default');
        }
    });

    const apply = (chain: Chain) => {
        // @ts-expect-error
        const pluginKeys = chain.plugins.store.keys();
        for (let key of pluginKeys) {
            if (key.startsWith('html')) {
                chain.plugins.delete(key);
            }
        }

        // 异步加载
        const splitChunksOptions = chain.optimization.get('splitChunks');
        if (splitChunksOptions) {
            splitChunksOptions.chunks = 'async';
            chain.optimization.splitChunks(splitChunksOptions);
        }
    };

    apply.enforce = 'post';

    // @ts-expect-error
    api.chainWebpack(apply);
}
