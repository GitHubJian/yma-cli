import fs from 'fs';
import {pathToRegexp} from 'path-to-regexp';
import {log, warn} from 'yma-shared-util';

function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

export default function createMiddleware(api, mock) {
    const mockPath = api.resolve(mock);

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

                    if (isPlainObject(isPlainObject)) {
                        const key = `${method} ${url}`;

                        const mock = mockContent[key];
                        if (typeof mock === 'function') {
                            mock.call(null, req, res);
                        } else if (isPlainObject(mock)) {
                            res.send(mock);
                        } else if (typeof mock === 'string') {
                            res.send({
                                code: 200,
                                message: mock,
                            });
                        } else if (typeof mock === 'number') {
                            res.send({
                                code: mock,
                                message: 'success',
                            });
                        } else {
                            next();
                        }
                    } else {
                        let response;
                        for (let i = 0; i < mock.length; i++) {
                            let item = mock[i];
                            const re = pathToRegexp(item.url);

                            if (re.exec(url) && method == item.method.toLowerCase()) {
                                response = item.response;
                                break;
                            }
                        }

                        if (response) {
                            const result = response(req, res);
                            res.send(result);
                        } else {
                            next();
                        }
                    }
                },
            });

            return middlewares;
        };
    }

    log(`未能找到 Mock 文件夹（${mock}）`, 'CLI DEV');

    return (middlewares, devServer) => {
        if (!devServer) {
            throw new Error('webpack-dev-server is not defined');
        }

        return middlewares;
    };
}
