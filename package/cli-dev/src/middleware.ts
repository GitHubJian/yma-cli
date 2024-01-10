import fs from 'fs';
import {pathToRegexp} from 'path-to-regexp';
import {log, warn} from 'yma-shared-util';

function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

export default function createMiddleware(api, mock) {
    if (!mock) {
        warn(`未开启本地 Mock 服务`, 'CLI DEV');

        return function (middlewares, devServer) {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            return middlewares;
        };
    }

    const mockPath = api.resolve('mock');

    const delay = function (fn) {
        setTimeout(function () {
            fn();
        }, 1000);
    };

    if (fs.existsSync(mockPath)) {
        return function (middlewares, devServer) {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            devServer.app.get('/setup-middleware/some/path', (_, response) => {
                response.send('setup-middlewares option GET');
            });

            middlewares.unshift({
                path: '/',
                middleware: (req, res, next) => {
                    let mockContent;

                    try {
                        let filepath = require.resolve(mockPath);
                        delete require.cache[filepath];
                        mockContent = require(mockPath);
                    } catch (error) {
                        warn(`未能找到 Mock 文件（${mockPath}）`, 'CLI DEV');

                        next();

                        return;
                    }

                    const url = req.path;
                    const method = req.method.toUpperCase();

                    if (isPlainObject(mockContent)) {
                        const key = `${method} ${url}`;

                        const mock = mockContent[key];

                        if (typeof mock === 'function') {
                            delay(function () {
                                mock.call(null, req, res, next);
                            });
                        } else if (isPlainObject(mock)) {
                            delay(function () {
                                if (mock.enabled === false) {
                                    next();
                                } else {
                                    res.send(mock);
                                }
                            });
                        } else if (typeof mock === 'string') {
                            delay(function () {
                                res.send({
                                    code: 200,
                                    message: mock,
                                });
                            });
                        } else if (typeof mock === 'number') {
                            delay(function () {
                                res.send({
                                    code: mock,
                                    message: 'success',
                                });
                            });
                        } else {
                            next();
                        }
                    } else {
                        let response;
                        for (let i = 0; i < mockContent.length; i++) {
                            let item = mockContent[i];
                            const re = pathToRegexp(item.url);

                            if (
                                re.exec(url) &&
                                method == (item.method || 'get').toUpperCase()
                            ) {
                                response = item.response;
                                break;
                            }
                        }

                        if (response) {
                            const result = response(req, res);

                            delay(function () {
                                if (result === false) {
                                    next();
                                } else {
                                    res.send(result);
                                }
                            });
                        } else {
                            next();
                        }
                    }
                },
            });

            return middlewares;
        };
    } else {
        log(`未能找到 Mock 文件夹（${mock}）`, 'CLI DEV');

        return (middlewares, devServer) => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            return middlewares;
        };
    }
}
