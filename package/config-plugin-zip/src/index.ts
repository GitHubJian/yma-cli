import PluginAPI, {Chain} from 'yma-config-plugin';
import ZipWebpackPlugin, {ZipWebpackPluginOptions} from './zip-webpack-plugin';

export default function (api: PluginAPI, options: ZipWebpackPluginOptions = {}) {
    api.chainWebpack((chain: Chain) => {
        chain.plugin('flexible').use(ZipWebpackPlugin, [options]);
    });
}
