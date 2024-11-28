import main from './main';

export = {
    command: 'zip',
    describe: '压缩文件夹',
    builder: function builder(yargs) {
        yargs.options('folder', {
            type: 'string',
            description: '待压缩文件夹',
            default: './dist',
        });

        yargs.options('others', {
            type: 'string',
            description: '额外的文件，以逗号拆分',
            default: '',
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
            default: true,
            description: '时间戳',
        });

        yargs.options('extnames', {
            type: 'string',
            description: '匹配文件名后缀',
            default: '.html,.js,.css,.json',
        });

        return yargs;
    },
    handler: async function (argv) {
        try {
            const others = argv.others
                .split(',')
                .map(function (str) {
                    return str.trim();
                })
                .filter(v => v);

            const extnames = argv.extnames
                .split(',')
                .map(function (str) {
                    return str.trim();
                })
                .filter(v => v);

            main(argv.folder, others, {
                cwd: process.cwd(),
                type: argv.type,
                tag: !!argv.tag,
                extnames: extnames,
            });
        } catch (e) {
            console.error(e);
        }
    },
};
