import koa from 'koa';
import ip from 'ip';
import portfinder from 'portfinder';
import {chalk} from 'yma-shared-util';
import assetMiddleware from './middleware/asset';
// import imagePlaceholderMiddleware from './middleware/image-placeholder';

const host = ip.address();

async function start(
    config: Partial<{
        folder: string;
    }>
) {
    const options = Object.assign(
        {},
        {
            folder: process.cwd(),
            port: 8421,
        },
        config
    ) as {
        folder: string;
        port: number;
    };

    portfinder.basePort = +options.port;
    const port = await portfinder.getPortPromise();

    const app = new koa();

    // app.use(imagePlaceholderMiddleware());

    app.use(assetMiddleware(options));

    app.listen(port, function () {
        const localUrl = `http://localhost:${port}`;
        const networkUrl = `http://${host}:${port}`;

        console.log();
        console.log(`Service running at:`);
        console.log(`- Local:   ${chalk.cyan(localUrl)}`);
        console.log(`- Network: ${chalk.cyan(networkUrl)}`);
    });
}

export default start;
