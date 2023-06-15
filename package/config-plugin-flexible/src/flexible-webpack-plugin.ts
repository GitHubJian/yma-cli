import webpack from 'webpack';
import safeRequire from 'safe-require';

import createScriptTag from './create-script-tag';

const OUTLET = '<!-- flexible-webpack-plugin-outlet -->';

interface PluginOptions {
    isUglify?: boolean;
}

export default class FlexibleWebpackPlugin {
    isUglify: boolean;

    constructor(options: PluginOptions = {}) {
        this.isUglify = !!options.isUglify;
    }

    apply(compiler: webpack.Compiler): void {
        compiler.hooks.compilation.tap(this.constructor.name, compilation => {
            const HtmlWebpackPlugin = safeRequire('html-webpack-plugin');

            const emit = HtmlWebpackPlugin.getHooks(compilation).beforeEmit;

            emit.tapAsync(this.constructor.name, (data, cb) => {
                let html = data.html;
                if (html.includes(OUTLET)) {
                    const replacement = createScriptTag(this.isUglify);

                    data.html = html.replace(OUTLET, replacement);
                } else {
                    console.error(`[FlexibleWebpackPlugin]: not found outlet(${OUTLET})`);

                    process.exit(0);
                }

                cb(null, data);
            });
        });
    }
}
