import creator from './creator';

export = {
    command: 'init',
    describe: '快速创建仓库',
    builder: function builder(yargs) {
        yargs.options('name', {
            alias: 'n',
            type: 'string',
            description: '目录名',
            default: '.',
        });

        yargs.options('cwd', {
            type: 'string',
            description: '执行上下文路径',
            default: process.cwd(),
        });

        return yargs;
    },
    handler: async function (argv) {
        try {
            await creator(argv.name, {
                cwd: argv.cwd,
            });
        } catch (error) {
            console.log(error);
        }
    },
};
