import dayjs from 'dayjs';
import webpack, {EntryPlugin} from 'webpack';
import path from 'path';
import safeRequire from 'safe-require';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {load} from 'cheerio';

const entryjs = path.resolve(__dirname, '../public/index.js');
const PLUGIN_NAME = 'VersionPlugin';

class VersionPlugin {
    apply(compiler) {
        const version = dayjs(Date.now()).format('YYYYMMDDHHmmss');
        const content = JSON.stringify({
            version,
        });

        compiler.hooks.entryOption.tap(PLUGIN_NAME, (context, entry) => {
            entry.version = {
                import: [entryjs],
            };
        });
        compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
            compilation.assets['version.json'] = {
                source: function () {
                    return content;
                },
                size: function () {
                    return content.length;
                },
            };

            callback();
        });

        // compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
        //     const beforeEmit =
        //         HtmlWebpackPlugin.getHooks(compilation).beforeEmit;
        //     debugger;
        //     beforeEmit.tapAsync(PLUGIN_NAME, (data, cb) => {
        //         debugger;
        //         console.log(123);
        //         let html = data.html;
        //         console.log(html);
        //         const $ = load(html);
        //         $('head').append(
        //             `<script>window.__version__ = "${version}"</script>`
        //         );

        //         data.html = $.html();
        //         cb(null, data);
        //     });
        // });
    }
}

export default VersionPlugin;
