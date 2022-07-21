import path from 'path';
import webpack, {Configuration} from 'webpack';
import url from 'url';
import WebpackDevServer from 'webpack-dev-server';
import portfinder from 'portfinder';
import {info, chalk} from 'yma-shared-util';
import WebpackAPI, {ProjectOptions} from 'yma-config-plugin';
import prepareURL from './util/prepare-url';
import isAbsoluteUrl from './util/is-absolute-url';
import prepareProxy from './util/prepare-proxy';

const defaults = {
    host: '0.0.0.0',
    port: 8421,
};

function addDevClientToEntry(config: Configuration, devClient: string[]): void {
    const {entry} = config;

    if (typeof entry === 'object' && !Array.isArray(entry)) {
        Object.keys(entry).forEach(key => {
            entry[key] = devClient.concat(entry[key] as string[]);
        });
    } else {
        config.entry = devClient.concat(entry as string);
    }
}

function genHistoryApiFallbackRewrites(
    baseUrl: string,
    pages = {}
): Array<{
    from: RegExp;
    to: any;
}> {
    const multiPageRewrites = Object.keys(pages)
        .sort((a, b) => b.length - a.length)
        .map(name => ({
            from: new RegExp(`^/${name}`),
            to: path.posix.join(
                baseUrl,
                pages[name].filename || `${name}.html`
            ),
        }));

    return [
        ...multiPageRewrites,
        {
            from: /./,
            to: path.posix.join(baseUrl, 'index.html'),
        },
    ];
}

export default async function dev(
    args: any,
    api: WebpackAPI
): Promise<{
    server: WebpackDevServer;
    url: string;
}> {
    info('Starting development server...');
    const options: ProjectOptions = api.projectOptions;

    const webpackConfig = await api.toConfig();

    const devServerOptions = Object.assign(
        webpackConfig.devServer || {},
        options.devServer || {}
    );

    const protocol = 'http';
    const host = process.env.HOST || devServerOptions.host || defaults.host;
    portfinder.basePort = +(
        process.env.PORT ||
        devServerOptions.port ||
        defaults.port
    );
    const port = await portfinder.getPortPromise();

    const urls = prepareURL(
        protocol,
        host,
        port,
        isAbsoluteUrl(options.publicPath) ? '/' : options.publicPath
    );
    const localUrlForBrowser = urls.localUrlForBrowser;

    const proxySettings = prepareProxy(
        devServerOptions.proxy,
        api.resolve('public')
    );

    const sockPath = '/sockjs-node';
    const sockjsUrl =
        '?' +
        url.format({
            protocol,
            port,
            hostname: urls.lanUrlForConfig || 'localhost',
        }) +
        `&sockPath=${sockPath}`;
    const devClients = [
        // dev server client
        require.resolve('webpack-dev-server/client') + sockjsUrl,
        // hmr client
        require.resolve('webpack/hot/dev-server'),
    ];

    // inject dev/hot client
    addDevClientToEntry(webpackConfig, devClients);
    // create compiler
    const compiler = webpack(webpackConfig);
    // create server
    const devServerConfig = Object.assign(
        {
            historyApiFallback: {
                disableDotRule: true,
                rewrites: genHistoryApiFallbackRewrites(
                    options.publicPath,
                    options.page
                ),
            },
            hot: true,
            compress: false,
            open: false,
            allowedHosts: 'all',
            client: {
                logging: 'info',
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
            port,
        },
        devServerOptions,
        {
            proxy: proxySettings,
        }
    );
    const server = new WebpackDevServer(devServerConfig, compiler);

    return new Promise((resolve, reject) => {
        let isFirstCompile = true;

        compiler.hooks.done.tap('cli dev', stats => {
            if (stats.hasErrors()) {
                return;
            }

            const networkUrl = urls.lanUrlForTerminal;

            console.log();
            console.log('  App running at:');
            console.log(`  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`);
            console.log(`  - Network: ${chalk.cyan(networkUrl)}`);

            if (isFirstCompile) {
                isFirstCompile = false;

                // resolve returned Promise
                resolve({
                    server,
                    url: localUrlForBrowser,
                });
            }
        });

        server.start().catch(err => {
            reject(err);
        });
    });
}
