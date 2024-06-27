import PluginAPI, {Chain} from 'yma-config-plugin';
import VersionPlugin from './version-plugin';

export interface Options {}

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        if (api.isProd) {
            chain.plugin('version-plugin').use(VersionPlugin);
        }
    });
}
