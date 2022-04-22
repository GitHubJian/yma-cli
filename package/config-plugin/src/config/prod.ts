import Chain from '../../chain';
import PluginAPI from '..';

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        if (api.isProd) {
            chain.mode('production').devtool(false);

            chain.optimization.minimize(!!api.cliArgv.minimize);
        }
    });
}
