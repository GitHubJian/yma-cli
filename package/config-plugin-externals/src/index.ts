import WebpackAPI, {Chain} from 'yma-config-plugin';

export interface PluginOptions {
    externals?: string[];
}

export default function (api: WebpackAPI, pluginOptions: PluginOptions) {
    const apply = (chain: Chain) => {
        if (pluginOptions.externals && pluginOptions.externals.length > 0) {
            chain.externals(pluginOptions.externals);
        }
    };

    api.chainWebpack(apply);
}
