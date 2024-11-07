import PluginAPI, {Chain} from 'yma-config-plugin';
import LegalDepsWebpackPlugin, {LegalDepsWebpackPluginConfig} from './plugin';

export default function (api: PluginAPI, pluginOptions: LegalDepsWebpackPluginConfig) {
    api.chainWebpack((chain: Chain) => {
        chain.plugin('legaldeps').use(LegalDepsWebpackPlugin, [pluginOptions]);
    });
}

export {LegalDepsWebpackPlugin};
