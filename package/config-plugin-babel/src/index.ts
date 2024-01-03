import path from 'path';
import PluginAPI, {Chain} from 'yma-config-plugin';
import {isWindows} from 'yma-shared-util';

function getDepPathRegex(dependencies: Array<string | RegExp>): RegExp | null {
    const deps = dependencies.map(dep => {
        if (typeof dep === 'string') {
            const depPath = path.join('node_modules', dep, '/');
            return isWindows ? depPath.replace(/\\/g, '\\\\') : depPath;
        } else if (dep instanceof RegExp) {
            return dep.source;
        }

        throw new Error('transpileDependencies only accepts an array of string or regular expressions');
    });
    return deps.length ? new RegExp(deps.join('|')) : null;
}

export default async function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        const jsRule = chain.module
            .rule('js')
            .test(/\.m?js$/)
            .exclude.add(filepath => {
                const SHOULD_SKIP = true;
                const SHOULD_TRANSPILE = false;
                if (!filepath) {
                    return SHOULD_SKIP;
                }

                if (/\.vue\.jsx?$/.test(filepath)) {
                    return SHOULD_TRANSPILE;
                }

                if (getDepPathRegex(['@babel/runtime'])!.test(filepath)) {
                    return SHOULD_SKIP;
                }

                const transpileDependencies = api.projectOptions.transpileDependencies;

                if (transpileDependencies === true) {
                    const NON_TRANSPILABLE_DEPS = [
                        'core-js',
                        'webpack',
                        'webpack-4',
                        'css-loader',
                        'mini-css-extract-plugin',
                        'promise-polyfill',
                        'html-webpack-plugin',
                        'whatwg-fetch',
                    ];

                    const nonTranspilableDepsRegex = getDepPathRegex(NON_TRANSPILABLE_DEPS);
                    return nonTranspilableDepsRegex!.test(filepath) ? SHOULD_SKIP : SHOULD_TRANSPILE;
                }

                if (Array.isArray(transpileDependencies)) {
                    const transpileDepRegex = getDepPathRegex(transpileDependencies);
                    if (transpileDepRegex && transpileDepRegex.test(filepath)) {
                        return SHOULD_TRANSPILE;
                    }
                }

                return filepath.includes('node_modules') ? SHOULD_SKIP : SHOULD_TRANSPILE;
            })
            .end();

        let babelrc;
        try {
            // TODO others https://www.babeljs.cn/docs/config-files
            babelrc = require.resolve(api.resolve('babel.config.js'));
        } catch (error) {
            babelrc = require.resolve(path.resolve(__dirname, '../public/babel.config.js'));
        }

        jsRule.use('babel-loader').loader(require.resolve('babel-loader')).options({
            cacheCompression: false,
            configFile: babelrc,
        });
    });
}
