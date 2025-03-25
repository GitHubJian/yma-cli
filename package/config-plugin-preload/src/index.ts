import PluginAPI, {Chain} from 'yma-config-plugin';
import PreloadWebpackPlugin from './preload-webpack-plugin';

interface ChainOptions {
    forceEnabled?: boolean;
}

export default function (api: PluginAPI, options: ChainOptions = {}) {
    api.chainWebpack((chain: Chain) => {
        if (options.forceEnabled === true || api.isProd) {
            chain.plugin('preload-plugin').use(PreloadWebpackPlugin, [options]);
        }
    });
}
