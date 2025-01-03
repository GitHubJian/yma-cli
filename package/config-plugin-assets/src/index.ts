import PluginAPI, {Chain} from 'yma-config-plugin';
import AssetsWebpackPlugin from './assets-webpack-plugin';

interface ChainOptions {
    forceEnabled?: boolean;
}

export default function (api: PluginAPI, options: ChainOptions = {}) {
    api.chainWebpack((chain: Chain) => {
        if (options.forceEnabled === true || api.isProd) {
            chain.plugin('assets-plugin').use(AssetsWebpackPlugin, [options]);
        }
    });
}
