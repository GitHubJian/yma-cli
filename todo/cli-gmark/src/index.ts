import main from './main';

export = {
    command: 'gmark',
    describe: 'GIT 操作集合',
    builder: function builder(yargs) {
        yargs.options('input', {
            alias: 'i',
            type: 'boolean',
            default: false,
            description: '通过Input添加描述',
        });

        yargs.options('current', {
            alias: 'c',
            type: 'string',
            default: '',
            description: '直接添加描述',
        });

        yargs.options('delete', {
            alias: 'd',
            type: 'boolean',
            default: false,
            description: '删除描述信息',
        });

        yargs.options('repo', {
            alias: 'r',
            type: 'boolean',
            default: false,
            description: '可选择的仓库',
        });

        return yargs;
    },
    handler: async function (argv) {
        try {
            debugger;
            const cwd = process.cwd();
            const isInput = argv.input || argv.current.length > 0;

            await main(isInput, {
                current: argv.current,
                delete: argv.delete,
                repo: argv.repo,
                cwd,
            });
        } catch (e) {
            console.error(e);
        }
    },
};
