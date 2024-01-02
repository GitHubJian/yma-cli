import {ProgressPlugin, HotModuleReplacementPlugin} from 'webpack';
import Chain from '../../chain';
import PluginAPI from '..';

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        if (!api.isProd) {
            // @ts-ignore
            chain.devtool('eval-cheap-module-source-map');
            chain.plugin('hmr').use(HotModuleReplacementPlugin);
            chain.output.globalObject("(typeof self !== 'undefined' ? self : this)");
            chain.plugin('progress').use(ProgressPlugin);
        }
    });
}
