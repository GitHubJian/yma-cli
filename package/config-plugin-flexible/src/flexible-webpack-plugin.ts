import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import createScriptTag from './create-script-tag';

const OUTLET = '<!-- flexible-webpack-plugin-outlet -->';

interface PluginOptions {
    isUglify?: boolean;
}

const PLUGIN_NAME = 'FlexibleWebpackPlugin';

export default class FlexibleWebpackPlugin {
    isUglify: boolean;

    constructor(options: PluginOptions = {}) {
        this.isUglify = !!options.isUglify;
    }

    apply(compiler: webpack.Compiler): void {
        let HWPCtor;
        compiler.hooks.environment.tap(PLUGIN_NAME, function () {
            const plugins = compiler.options.plugins;

            for (let i = 0, len = plugins.length; i < len; i++) {
                let plugin = plugins[i] as HtmlWebpackPlugin;
                if (
                    plugin['__pluginConstructorName'] == HtmlWebpackPlugin.name
                ) {
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
                    if (html.includes(OUTLET)) {
                        const replacement = createScriptTag(this.isUglify);

                        data.html = html.replace(OUTLET, replacement);
                    } else {
                        console.error(
                            `[FlexibleWebpackPlugin]: not found outlet(${OUTLET})`
                        );

                        process.exit(0);
                    }

                    cb(null, data);
                });
            }
        });
    }
}
