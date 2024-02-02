import main from './main';

export = {
    command: 'docker',
    // command: 'docker <cmd>',
    describe: '在 Web 项目中构建 Docker 镜像',
    builder: function builder(yargs) {
        // yargs.options('cmd', {
        //     type: 'string',
        //     default: 'build',
        //     description: '执行 Build 命令',
        // });

        yargs.options('type', {
            type: 'string',
            default: 'patch',
            description: '版本号自增方案',
        });

        yargs.options('cwd', {
            type: 'string',
            description: '执行上下文',
        });

        return yargs;
    },
    handler: async function (argv) {
        try {
            main({
                type: argv.type,
                cwd: argv.cwd || process.cwd(),
            });
        } catch (e) {
            console.error(e);
        }
    },
};
