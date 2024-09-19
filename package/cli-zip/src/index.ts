import main from './main';

export = {
    command: 'zip',
    describe: '压缩文件夹',
    builder: function builder(yargs) {
        yargs.options('folder', {
            type: 'string',
            description: '待压缩文件夹',
            default: 'output',
        });

        yargs.options('type', {
            type: 'string',
            description: '输出文件类型',
            default: 'zip',
            choices: ['zip', 'tar', 'tar.gz'],
        });

        yargs.options('tag', {
            alias: 't',
            type: 'boolean',
            description: '时间戳',
        });

        return yargs;
    },
    handler: async function (argv) {
        try {
            main(argv.folder, {
                cwd: process.cwd(),
                type: argv.type,
                tag: !!argv.tag,
            });
        } catch (e) {
            console.error(e);
        }
    },
};
