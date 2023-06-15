import {error, info, log} from 'yma-shared-util';
import fs from 'fs';
import path from 'path';
import semver from 'semver';
import {exit} from 'process';

function getPkg<T>(projectPath: string): T {
    const packagePath = path.join(projectPath, 'package.json');

    let packageJson;
    try {
        packageJson = fs.readFileSync(packagePath, 'utf-8');
    } catch (err) {
        throw new Error(`The package.json file at '${packagePath}' does not exist`);
    }

    try {
        packageJson = JSON.parse(packageJson);
    } catch (err) {
        throw new Error('The package.json is malformed');
    }

    return packageJson;
}

export = {
    command: 'env',
    describe: '根据 Package.json 中 Engine 调整环境',
    builder: function builder(yargs) {
        yargs.options('default', {
            type: 'boolean',
            description: '将 node 设置为 default',
        });

        return yargs;
    },
    handler: async function (argv) {
        try {
            const cwd = process.cwd();
            const pkg = getPkg<{
                engines: {
                    node: string;
                    yarn: string;
                };
            }>(cwd);
            const engines = pkg.engines;

            if (!engines) {
                error(`未找到 Package.json at \n${cwd}`, 'ENV');
            }

            const wanted = engines.node;
            if (!semver.satisfies(process.version, wanted)) {
                info(`Upgrade node@${process.version} -> ${wanted}`, 'ENV');

                exit();
            } else {
                log('Node 版本符合要求，愉快的 Coding 吧。', 'ENV');
            }

            // res = await execa('nvm', ['use', wanted]);
            // if (res.stdout.startsWith('N/A')) {
            //     await execa('nvm', ['install', wanted]);
            // }

            // if (argv.default) {
            //     res = await execa('nvm', ['alias', 'default', wanted]);
            // } else {
            //     res = await execa('nvm', ['use', wanted]);
            // }

            // res = await execa('node', ['-v']);

            // if (res.stdout === `v${wanted}`) {
            //     done('环境切换成功', 'ENV');
            // } else {
            //     error('环境切换失败，请手动进行切换。', 'ENV');
            // }
        } catch (e) {
            console.error('ENV 未知异常：');
            console.error(e);
        }
    },
};
