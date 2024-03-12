import main from './main';

export = {
    command: 'server',
    describe: '启动静态服务器',
    builder: function builder(yargs) {
        yargs.options('folder', {
            type: 'string',
            description: '静态资源文件夹',
        });

        return yargs;
    },
    handler: async function (argv) {
        await main({
            folder: argv.folder || process.cwd(),
        });
    },
};
