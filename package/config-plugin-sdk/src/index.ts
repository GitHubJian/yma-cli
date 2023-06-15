import PluginAPI, {Chain} from 'yma-config-plugin';
import {resolvePkg} from 'yma-shared-util';

export interface Options {
    name: string;
    default?: boolean;
    externals?: string[];
}

export default function (api: PluginAPI, options: Options) {
    const pkg = resolvePkg<{name: string}>(api.context) as {name: string};
    const name = options.name || pkg.name;

    api.chainWebpack((chain: Chain) => {
        chain.output.filename('[name].js').chunkFilename('[name].chunk.js').library(name).libraryTarget('umd');

        if (options.default) {
            chain.output.libraryExport('default');
        }

        if (options.externals && options.externals.length > 0) {
            chain.externals(options.externals);
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
    };

    apply.enforce = 'post';

    // @ts-expect-error
    api.chainWebpack(apply);
}
