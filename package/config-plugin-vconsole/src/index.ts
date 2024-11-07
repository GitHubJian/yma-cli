import PluginAPI, {Chain} from 'yma-config-plugin';
import VCosnoleWebpackPlugin from './vconsole-webpack-plugin';

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        if (!api.isProd) {
            chain.plugin('vconsole-plugin').use(VCosnoleWebpackPlugin, []);
        }
    });
}

export {VCosnoleWebpackPlugin};
