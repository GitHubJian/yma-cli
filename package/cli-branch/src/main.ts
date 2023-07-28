import inquirer from 'inquirer';
import {rc as createRC} from 'yma-shared-util';
import * as git from './git';

const rc = createRC('git');

function createTime(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    return [year, month, day, hour, minute, second].join('-');
}

export default async function main(cwd) {
    const rcContent = rc.load();
    const branchs = git.branchs(cwd);

    const choices = branchs.map(function (name) {
        let desc = '主干';

        if (!['master', 'main'].includes(name)) {
            const content = rcContent[name] || {};
            desc = content.desc || 'NULL';
        }

        return {
            name: `${name} (${desc})`,
            value: name,
        };
    });

    const answer = await inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: '请输入分支名：',
            default: `feat_${createTime(new Date())}_BRANCH`,
        },
        {
            name: 'main',
            type: 'list',
            message: '选择源分支',
            choices: choices,
        },
        {
            name: 'desc',
            type: 'input',
            message: '请输入当前分支描述：',
        },
    ]);

    git.checkout(answer.main, cwd);
    // git.pull(cwd);
    git.branch(answer.name, cwd);
    git.checkout(answer.name, cwd);
    // git.push(answer.name, cwd);

    rcContent[answer.name] = {
        desc: answer.desc,
    };

    // 存储
    rc.save(rcContent);
}
