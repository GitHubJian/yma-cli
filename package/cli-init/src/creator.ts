import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';

export default async function (projectName, options) {
    const cwd = options.cwd || process.cwd();
    const inCurrent = projectName === '.';
    const targetDir = path.resolve(cwd, projectName || '.');

    if (fs.existsSync(targetDir)) {
        if (inCurrent) {
            const {ok} = await inquirer.prompt([
                {
                    name: 'ok',
                    type: 'confirm',
                    message: '在当前目录下创建项目？',
                },
            ]);

            if (!ok) {
                return;
            }
        }

        const files = fs.readdirSync(targetDir);
        if (files.length > 0) {
            const {action} = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    message: `目标目录 ${chalk.cyan(targetDir)} 下存在文件，请选择执行方式：`,
                    choices: [
                        {name: '覆盖', value: 'overwrite'},
                        {name: '取消', value: false},
                    ],
                },
            ]);

            if (!action) {
                return;
            } else if (action === 'overwrite') {
                console.log(`\n正在清空 ${chalk.cyan(targetDir)} ...`);
                await fs.emptyDirSync(targetDir);
            }
        }
    }

    const {type} = await inquirer.prompt([
        {
            name: 'type',
            type: 'list',
            message: '请选择创建仓库的类型：',
            choices: [
                {name: 'WEB', value: 'web'},
                {name: 'NODE', value: 'node'},
            ],
        },
    ]);

    const sourceDir = path.resolve(__dirname, `../public/${type}`);

    try {
        fs.copySync(sourceDir, targetDir);
        console.log('\n目录复制成功！');
    } catch (err) {
        console.error('\n目录复制失败：' + err);
    }
}
