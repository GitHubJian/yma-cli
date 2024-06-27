import path from 'path';
import webpack, {EntryOptionPlugin} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {load} from 'cheerio';

const entryjs = path.resolve(__dirname, '../public/version.js');
const EntryKey = '__version__';
const PLUGIN_NAME = 'VersionPlugin';

function timestamp(date) {
    const d = new Date(date);

    const res = [
        d.getFullYear(),
        '-',
        d.getMonth() + 1,
        '-',
        d.getDate(),
        ' ',
        d.getHours(),
        ':',
        d.getMinutes(),
        ':',
        d.getSeconds(),
    ];

    return res.join('');
}

class VersionPlugin {
    apply(compiler: webpack.Compiler) {
        let version = timestamp(new Date());
        let content = JSON.stringify({
            version,
        });

        let HWPCtor;

        compiler.hooks.environment.tap(PLUGIN_NAME, function () {
            const plugins = compiler.options.plugins;

            for (let i = 0, len = plugins.length; i < len; i++) {
                let plugin = plugins[i] as HtmlWebpackPlugin;

                if (
                    plugin['__pluginConstructorName'] == HtmlWebpackPlugin.name
                ) {
                    if (plugin.userOptions.chunks) {
                        if (Array.isArray(plugin.userOptions.chunks)) {
                            if (!HWPCtor) {
                                HWPCtor = plugin.constructor;
                            }

                            plugin.userOptions.chunks.unshift(EntryKey);
                        }
                    }
                }
            }
        });

        compiler.hooks.entryOption.tap(PLUGIN_NAME, function (context, entry) {
            entry[EntryKey] = {
                import: [entryjs],
            };
            debugger
            EntryOptionPlugin.applyEntryOption(compiler, context, entry);
            return true;
        });

        compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
            compilation.hooks.afterProcessAssets.tap(
                PLUGIN_NAME,
                function (assets) {
                    // @ts-ignore
                    assets[EntryKey + '.json'] = {
                        source: function () {
                            return content;
                        },
                        size: function () {
                            return content.length;
                        },
                    };
                }
            );
        });

        // compiler.hooks.watchRun.tapAsync(PLUGIN_NAME, (_, callback) => {
        //     version = timestamp(new Date());
        //     content = JSON.stringify({
        //         version,
        //     });

        //     callback();
        // });

        compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
            if (HWPCtor) {
                const beforeEmit = HWPCtor.getHooks(compilation).beforeEmit;

                beforeEmit.tapAsync(PLUGIN_NAME, (data, callback) => {
                    let html = data.html;

                    const $ = load(html);
                    $('head').append(
                        `<script>window.__version__="${version}";</script>`
                    );

                    data.html = $.html();
                    callback(null, data);
                });
            }
        });
    }
}

export default VersionPlugin;
