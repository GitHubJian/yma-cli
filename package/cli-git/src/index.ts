import dayjs from 'dayjs';
import lib from './main';

function getDay(now) {
    return dayjs(now).format('YYYY-MM-DD');
}

function split(str) {
    return str.split(',').map(v => v.trim());
}

export = {
    command: 'git',
    describe: '统计团队 Repo 代码行数据',
    builder: function builder(yargs) {
        return yargs
            .options('repos', {
                type: 'string',
                description: '统计仓库',
            })
            .options('authors', {
                type: 'string',
                description: '统计同学',
            })
            .options('since', {
                type: 'string',
                description: '开始时间',
                default: getDay(Date.now()),
            })
            .options('until', {
                type: 'string',
                description: '结束时间',
                default: getDay(Date.now() + 24 * 60 * 60 * 1000),
            });
    },
    handler: async function (argv) {
        await lib(split(argv.repos), argv.since, argv.until, split(argv.authors));
    },
};
