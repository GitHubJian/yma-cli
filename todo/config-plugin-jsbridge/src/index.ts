import PluginAPI, {Chain} from 'yma-config-plugin';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {load} from 'cheerio';
import createScriptTag from './create-script-tag';

const PLUGIN_NAME = 'JSBridgeWebpackPlugin';

const isMock = process.env.YMA_MOCK_ENABLE == 'true';

interface WebpackPluginOptions {
    ns: string;
}

class JSBridgeWebpackPlugin {
    ns: string;

    constructor(options: Partial<WebpackPluginOptions>) {
        this.ns = options.ns || '__js_bridge__';
    }

    apply(compiler: webpack.Compiler): void {
        const ns = this.ns;

        let HWPCtor;
        compiler.hooks.environment.tap(PLUGIN_NAME, function () {
            const plugins = compiler.options.plugins;

            for (let i = 0, len = plugins.length; i < len; i++) {
                let plugin = plugins[i] as HtmlWebpackPlugin;
                // @ts-ignore
                if (plugin.__pluginConstructorName == HtmlWebpackPlugin.name) {
                    if (!HWPCtor) {
                        HWPCtor = plugin.constructor;
                    }
                }
            }
        });

        compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
            if (HWPCtor) {
                const beforeEmit = HWPCtor.getHooks(compilation).beforeEmit;
                beforeEmit.tapAsync(PLUGIN_NAME, (data, cb) => {
                    let html = data.html;

                    const $ = load(html);
                    const replacement = createScriptTag(ns, isMock);
                    $('head').append(replacement);
                    data.html = $.html();

                    cb(null, data);
                });
            }
        });
    }
}

interface PluginOptions {
    ns: string;
}

export default function (api: PluginAPI, options: PluginOptions) {
    api.chainWebpack((chain: Chain) => {
        chain.plugin('jsbridge-plugin').use(JSBridgeWebpackPlugin, [
            {
                ns: options.ns,
            },
        ]);
    });
}
