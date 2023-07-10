import lib, {GenerateOptions, Tool} from './gen';
import {CommandModule} from 'yargs';

const options: CommandModule = {
    command: 'gi',
    describe: '生成默认导出文件 Index',
    builder: function builder(yargs) {
        process.env.NODE_ENV = 'development';

        yargs
            .options('cwd', {
                type: 'string',
                description: '执行上下文',
                default: process.cwd(),
            })

            .options('tool', {
                type: 'string',
                description: '类型(Util or Component)',
                default: 'util',
            })
            .options('filetype', {
                type: 'string',
                description: '查找文件类型',
                default: 'js',
            })
            .options('exportFilename', {
                type: 'string',
                description: '导出文件的名字',
                default: 'index',
            })
            .options('exportContentType', {
                type: 'string',
                description: '导出文件内容类型',
                default: 'unite',
            })
            .options('exportContentTarget', {
                type: 'string',
                description: '生成文件的类型',
                default: 'module',
            })
            .options('ignore', {
                type: 'string',
                description: '忽略文件前缀',
                default: '_',
            });

        return yargs;
    },
    handler: async function (argv) {
        await lib(argv.cwd as string, argv as unknown as GenerateOptions);
    },
};

export = options;
