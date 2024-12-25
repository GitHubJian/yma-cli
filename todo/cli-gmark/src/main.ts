import inquirer from 'inquirer';
import {log, warn, done, chalk} from 'yma-shared-util';
import {getCurrentBranch, getOriginUrl} from './git';
import {createCache} from './cache';

const cache = createCache('gmark');

const COLORS = {
    0: 'red',
    1: 'green',
    2: 'blue',
};

async function list(repo: string, cwd: string) {
    const cacheContent = cache.get();

    const originUrl = repo || getOriginUrl(cwd);
    const currentBranch = getCurrentBranch(cwd);
    const content = cacheContent[originUrl] || {};

    const keys = Object.keys(content).sort();
    if (keys.length == 0) {
        log();
        done('当前仓库不存在描述信息', '[Gmark]');

        return;
    }

    log();
    log('描述信息如下：', '[Gmark]');
    log();

    keys.forEach(function (key, i) {
        const message: string[] = [];
        if (key == currentBranch) {
            message.push('*');
        } else {
            message.push(' ');
        }

        message.push(key);

        const value = content[key];
        message.push(value);

        const str = message.join(' ');

        const color = COLORS[i % 3];
        log(chalk[color](str));
    });

    log();
    done('描述信息输出完成', '[Gmark]');
}

async function remove(repo: string, cwd: string) {
    const cacheContent = cache.get();

    const originUrl = repo || getOriginUrl(cwd);
    const content = cacheContent[originUrl] || {};

    const keys = Object.keys(content).sort();
    if (keys.length == 0) {
        log();
        done('当前仓库不存在描述信息', '[Gmark]');

        return;
    }

    log();
    log('描述信息如下：', '[Gmark]');
    log();
    const choices = keys.map(function (key) {
        return {
            name: key + ' -> ' + content[key],
            value: key,
        };
    });
    const {name} = await inquirer.prompt([
        {
            name: 'name',
            type: 'list',
            message: '请选择要移除的描述信息：',
            choices: choices,
        },
    ]);
    const {ok} = await inquirer.prompt([
        {
            name: 'ok',
            type: 'confirm',
            message: `是否确认要移除 ${name} 的描述信息？`,
        },
    ]);

    if (!ok) {
        return;
    }

    content[name] = null;
    delete content[name];

    cacheContent[originUrl] = content;
    cache.set(cacheContent);

    log();
    done('描述信息移除成功', '[Gmark]');
}

async function input(desc: string, repo: string, cwd: string) {
    const cacheContent = cache.get();

    const originUrl = repo || getOriginUrl(cwd);
    const currentBranch = getCurrentBranch(cwd);
    const content = cacheContent[originUrl] || {};

    let answer = {name: '', desc: ''};
    if (desc) {
        answer = {
            name: currentBranch,
            desc: desc,
        };
    } else {
        answer = await inquirer.prompt([
            {
                name: 'name',
                type: 'input',
                message: '请输入分支名：',
                default: currentBranch,
            },
            {
                name: 'desc',
                type: 'input',
                message: '请输入相关描述：',
                validate: function (answer) {
                    return answer && answer.length > 0;
                },
            },
        ]);
    }

    log();
    warn('即将更新 GMARK 存储内容如下：', '[Gmark]');
    warn(`分支名: ${answer.name}`);
    warn(`描述: ${answer.desc}`);
    log();

    // const {ok} = await inquirer.prompt([
    //     {
    //         name: 'ok',
    //         type: 'confirm',
    //         message: '确认更新？',
    //     },
    // ]);

    // if (!ok) {
    //     return;
    // }

    content[answer.name] = answer.desc;
    cacheContent[originUrl] = content;
    if (!cacheContent['list-of-records']) {
        cacheContent['list-of-records'] = {};
    }
    cache.set(cacheContent);

    log();
    done('更新成功', '[Gmark]');
}

export default async function (
    isInput: boolean,
    options: {
        cwd: string;
        current: string;
        delete: boolean;
        repo: boolean;
    },
) {
    debugger;
    let repo = '';
    if (options.repo) {
        const cacheContent = cache.get();
        const repoKeys = Object.keys(cacheContent);
        const choices = repoKeys.map(function (key) {
            return {
                name: key,
                value: key,
            };
        });

        const answer = await inquirer.prompt([
            {
                name: 'repo',
                type: 'list',
                message: '请选择仓库：',
                choices: choices,
            },
        ]);

        repo = answer.repo;
    }

    if (isInput) {
        input(options.current, repo, options.cwd);
    } else if (options.delete) {
        remove(repo, options.cwd);
    } else {
        list(repo, options.cwd);
    }
}
