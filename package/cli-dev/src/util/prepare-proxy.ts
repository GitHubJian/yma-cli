import fs from 'fs';
import url from 'url';
import path from 'path';
import address from 'address';
import http from 'http';
import {chalk} from 'yma-shared-util';
import DevServer from 'webpack-dev-server';

const defaultConfig = {
    logLevel: 'silent',
    secure: false,
    changeOrigin: true,
    ws: true,
    xfwd: true,
};

function resolveLoopback(proxy: string): string {
    const o = url.parse(proxy);
    o.host = null;
    if (o.host !== 'localhost') {
        return proxy;
    }

    try {
        if (!address.ip()) {
            o.hostname = '127.0.0.1';
        }
    } catch (_ignored) {
        o.hostname = '127.0.0.1';
    }

    return url.format(o);
}

function onProxyError(proxy) {
    return (err, req, res) => {
        const host = req.headers && req.headers.host;
        console.log(
            chalk.red('Proxy error:') +
                ' Could not proxy request ' +
                chalk.cyan(req.url) +
                ' from ' +
                chalk.cyan(host) +
                ' to ' +
                chalk.cyan(proxy) +
                '.',
        );

        console.log();
        if (res.writeHead && !res.headersSent) {
            res.writeHead(500);
        }
        res.end(`Proxy error: Could not proxy request ${req.url} from ${host} to ${proxy} (${err.code}).`);
    };
}

export default function prepareProxy(
    proxy: undefined | DevServer.ProxyConfigArray | DevServer.ProxyConfigMap | DevServer.ProxyConfigArrayItem,
    appPublicFolder: string,
): undefined | Record<string, unknown> | Array<Record<string, unknown>> {
    if (!proxy) {
        return undefined;
    }

    function mayProxy(pathname) {
        const maybePublicPath = path.resolve(appPublicFolder, pathname.slice(1));
        const isPublicFileRequest = fs.existsSync(maybePublicPath);
        const isWdsEndpointRequest = pathname.startsWith('/sockjs-node'); // used by webpackHotDevClient
        return !(isPublicFileRequest || isWdsEndpointRequest);
    }

    function createProxyEntry(
        target,
        usersOnProxyReq?: (proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse) => void,
        context?: string,
    ) {
        if (typeof target === 'string' && process.platform === 'win32') {
            target = resolveLoopback(target);
        }

        return {
            target,
            context(pathname, req) {
                if (!mayProxy(pathname)) {
                    return false;
                }

                if (context) {
                    return pathname.match(context);
                }

                if (req.method !== 'GET') {
                    return true;
                }

                return req.headers.accept && req.headers.accept.indexOf('text/html') === -1;
            },
            onProxyReq(proxyReq, req, res) {
                if (usersOnProxyReq) {
                    usersOnProxyReq(proxyReq, req, res);
                }

                if (!proxyReq.agent && proxyReq.getHeader('origin')) {
                    proxyReq.setHeader('origin', target);
                }
            },
            onError: onProxyError(target),
        };
    }

    if (typeof proxy === 'string') {
        if (!/^http(s)?:\/\//.test(proxy)) {
            console.log(
                chalk.red('When "proxy" is specified in yma.config.js it must start with either http:// or https://'),
            );
            process.exit(1);
        }

        return [Object.assign({}, defaultConfig, createProxyEntry(proxy))];
    }

    return Object.keys(proxy).map(context => {
        const config = proxy[context];

        if (!config.hasOwnProperty('target')) {
            console.log(
                chalk.red(
                    'When `proxy` in yma.config.js is an object, each `context` object must have a ' +
                        '`target` property specified as a url string',
                ),
            );
            process.exit(1);
        }

        const entry = createProxyEntry(config.target, config.onProxyReq, context);

        return Object.assign({}, defaultConfig, config, entry);
    });
}
