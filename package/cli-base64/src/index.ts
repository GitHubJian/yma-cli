import path from 'path';
import main from './main';

export = {
    command: 'base64',
    describe: '压缩文件夹',
    builder: function builder(yargs) {
        yargs.options('folder', {
            type: 'string',
            description: '待转换的文件夹',
            demandOption: true,
        });

        yargs.options('extnames', {
            type: 'string',
            description: '匹配文件名后缀',
            default: '.svg,.png,.jpg,.jpeg',
        });

        yargs.options('esModule', {
            type: 'string',
            description: '以ESModule形式输出',
            default: 'true',
        });

        // TODO keyType, 大驼峰，驼峰，下划线，默认
        return yargs;
    },
    handler: async function (argv) {
        try {
            const resource = path.resolve(process.cwd(), argv.folder);
            const extnames = argv.extnames
                .split(',')
                .map(function (str) {
                    return str.trim();
                })
                .filter(v => v);

            main({
                folder: resource,
                extnames: extnames,
                esModule: argv.esModule === 'true',
            });
        } catch (e) {
            console.error(e);
        }
    },
};
