import PluginAPI, {Chain} from 'yma-config-plugin';
import VersionPlugin from './version-plugin';

export interface Options {}

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        chain.plugin('version-plugin').use(VersionPlugin);
    });
}
