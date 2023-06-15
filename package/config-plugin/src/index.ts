import path from 'path';
import {Configuration} from 'webpack';
import defaultsDeep from 'lodash.defaultsdeep';
import loadConfig from 'yma-load-config';
import Plugin from './plugin';
import Chain from '../chain';
import {defaults, ProjectOptions} from './options';

type WebpackChainFn$ = (chain: Chain) => void;

export interface WebpackChainFn extends WebpackChainFn$ {
    enforce?: 'pre' | 'post';
}

export interface CLIArgv {
    minimize: boolean;
    html: boolean;
    entry: 'spa' | 'mpa' | 'dll';
    config: string;
}

export default class PluginAPI {
    mode: 'development' | 'production';
    context: string;
    cliArgv: Partial<CLIArgv>;
    plugins: Array<Plugin<any>>;
    projectOptions: ProjectOptions;

    webpackChainFns: WebpackChainFn[];

    constructor(context: string, mode: 'development' | 'production' = 'production', cliArgv: Partial<CLIArgv> = {}) {
        this.context = context || process.cwd();
        this.mode = mode;
        this.cliArgv = cliArgv || {};
        this.plugins = [];
        this.webpackChainFns = [];

        const customOptions = loadConfig<ProjectOptions>('yma.config.js', {
            props: [
                'publicPath',
                'outputDir',
                'assetsDir',
                'filenameHashing',
                'svgPaths',
                'page',
                'css',
                'chainWebpack',
                'configureWebpack',
                'devServer',
                'transpileDependencies',
            ],
            context: this.context,
        });

        this.projectOptions = defaultsDeep(customOptions, defaults());
        this.useBuiltinPlugins();

        const plugins = this.projectOptions.plugins || [];
        plugins.forEach(plugin => {
            const {resourcePath, options} = plugin as {
                request: string;
                resourcePath: string;
                options: any;
            };
            this.use(new Plugin(resourcePath, options));
        });
    }

    resolve(p: string): string {
        return path.resolve(this.context, p);
    }

    get isProd(): boolean {
        return this.mode === 'production';
    }

    get isDev(): boolean {
        return this.mode === 'development';
    }

    private useBuiltinPlugins() {
        const builtinPlugins: Array<[string, any?] | string> = [
            './config/app',
            './config/asset',
            './config/base',
            './config/css',
            './config/dev',
            './config/prod',
        ];

        for (let builtinPlugin of builtinPlugins) {
            builtinPlugin = typeof builtinPlugin === 'string' ? [builtinPlugin] : builtinPlugin;
            const [request, options] = builtinPlugin;
            const resourcePath = path.resolve(__dirname, request);
            const plugin = new Plugin(resourcePath, options);

            this.use<typeof options>(plugin);
        }
    }

    private async resolvePlugins() {
        for (const plugin of this.plugins) {
            await plugin.apply(this);
        }
    }

    private use<T>(plugin: Plugin<T>) {
        this.plugins.push(plugin);
    }

    chainWebpack(fn: WebpackChainFn) {
        this.webpackChainFns.push(fn);
    }

    private async toChainableConfig() {
        await this.resolvePlugins();
        if (this.projectOptions.chainWebpack) {
            this.webpackChainFns.push(this.projectOptions.chainWebpack);
        }

        const webpackChainPreFns = this.webpackChainFns.filter(fn => {
            const {enforce} = fn;

            return enforce === 'pre';
        });

        const webpackChainNormalFns = this.webpackChainFns.filter(fn => {
            const {enforce} = fn;

            return !enforce || (enforce !== 'post' && enforce !== 'pre');
        });

        const webpackChainPostFns = this.webpackChainFns.filter(fn => {
            const {enforce} = fn;

            return enforce === 'post';
        });

        const webpackChainFns = webpackChainPreFns.concat(webpackChainNormalFns).concat(webpackChainPostFns);

        const chain = new Chain();

        for (const fn of webpackChainFns) {
            fn(chain);
        }

        return chain;
    }

    async toConfig() {
        let chainableConfig = await this.toChainableConfig();
        let config = chainableConfig.toConfig();

        if (this.projectOptions.configureWebpack) {
            config = this.projectOptions.configureWebpack(config) || config;
        }

        return config;
    }
}

export {default as Chain} from '../chain';
export {default as findEntry} from './util/find-entry';
export {ProjectOptions} from './options';
