import PluginAPI, {Chain} from 'yma-config-plugin';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {SubresourceIntegrityPlugin} from 'webpack-subresource-integrity';
import {load} from 'cheerio';

const PLUGIN_NAME = 'CspWebpackPlugin';

interface PluginOptions {
    content: string;
}

class CspWebpackPlugin {
    content: string;

    constructor(options: PluginOptions) {
        this.content = options.content;
    }

    apply(compiler: webpack.Compiler): void {
        const that = this;

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
                    $('head').append(`<meta http-equiv="Content-Security-Policy" content="${that.content}">`);
                    data.html = $.html();

                    cb(null, data);
                });
            }
        });
    }
}

export interface Options {
    csp: string;
}

const defaults = function () {
    return {
        csp: "script-src 'self' 'unsafe-inline'",
    };
};

export default function (api: PluginAPI, options: Options) {
    api.chainWebpack((chain: Chain) => {
        if (api.isProd) {
            options = Object.assign({}, defaults(), options);
            const cspContent = options.csp;

            chain.plugin('csp-plugin').use(CspWebpackPlugin, [
                {
                    content: cspContent,
                },
            ]);

            chain.output.crossOriginLoading('anonymous');
            chain.plugin('subresource-integrity').use(SubresourceIntegrityPlugin, [
                {
                    hashFuncNames: ['sha384'],
                    enabled: true,
                    // @ts-ignore
                    hashLoading: 'lazy',
                },
            ]);
        }
    });
}
