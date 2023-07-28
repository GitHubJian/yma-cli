import fs from 'fs';
import path from 'path';
import ini from 'ini';
import os from 'os';
import inquirer from 'inquirer';
import {error, done, log} from 'yma-shared-util';

function update(registry, dirs) {
    let flag = false;

    for (let i = 0; i < dirs.length && !flag; i++) {
        const context = dirs[i];
        const filepath = path.resolve(context, '.npmrc');
        const isExists = fs.existsSync(filepath) && fs.statSync(filepath).isFile();

        if (isExists) {
            const oldData = ini.parse(fs.readFileSync(filepath, {encoding: 'utf-8'}));

            const newData = Object.assign({}, oldData, {
                registry,
            });

            const content = ini.stringify(newData);
            try {
                fs.writeFileSync(filepath, content, {encoding: 'utf-8'});
                done(`更新完成: ${context}/.npmrc`, '[YMA NSR]');
                console.log();

                flag = true;
            } catch (error) {}
        }
    }

    if (!flag) {
        error('未能成功更新 .npmrc 文件，请手动更新', '[YMA NSR]');
    }
}

export default async function main(context) {
    log('感谢使用 NPM 源切换工具 ...', '[YMA NSR]');
    console.log();

    const {registry} = await inquirer.prompt([
        {
            name: 'registry',
            type: 'list',
            message: '请选择镜像源：',
            choices: [
                {
                    name: 'npm',
                    value: 'https://registry.npmjs.org',
                },
                {
                    name: 'yarn',
                    value: 'https://registry.yarnpkg.com',
                },
                {
                    name: 'tencent',
                    value: 'https://mirrors.cloud.tencent.com/npm',
                },
                {
                    name: 'cnpm',
                    value: 'https://r.cnpmjs.org',
                },
                {
                    name: 'taobao',
                    value: 'https://registry.npmmirror.com',
                },
                {
                    name: 'baidu-int',
                    value: 'http://registry.npm.baidu-int.com',
                },
                {
                    name: 'didi',
                    value: 'http://registry.npm.xiaojukeji.com',
                },
            ],
        },
    ]);

    update(registry, [context, os.homedir()]);
}
