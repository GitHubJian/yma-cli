import path from 'path';
import fse from 'fs-extra';
import koaSend from 'koa-send';

export default function assetMiddleware(config: {folder: string}) {
    let maxage = 365 * 24 * 60 * 60 * 1000; // one year
    let folder = config.folder;

    return async function (ctx, next) {
        let reqPath = ctx.path;

        if (reqPath === '/') reqPath = '/index.html';

        let filePath = path.resolve(folder, `.${reqPath}`);
        let exists = await fse.pathExists(filePath);

        let result;
        if (exists) {
            result = await koaSend(ctx, reqPath, {
                root: folder,
                maxage,
                setHeaders: function (res, path, stats) {
                    res.setHeader('Author', 'yma-static-server');
                    res.setHeader('Cache-Control', `max-age=0,must-revalidate`);
                },
            });
        }

        if (!result) {
            ctx.status = 404;
            ctx.body = `404 | Not Found | ${ctx.path}`;
        }
    };
}
