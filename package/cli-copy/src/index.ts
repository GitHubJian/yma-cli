import copy from './copy';

interface Argv {
    context: string;
    bin: string;
}

export = {
    command: 'copy',
    describe: '复制 NPM 本地域下的 TOKEN',
    builder: function builder(yargs) {
        return yargs
            .options('context', {
                type: 'string',
                description: '执行命令上下文',
                default: '',
            })
            .options('bin', {
                type: 'string',
                description: '执行命令上下文',
                default: 'npm',
            });
    },
    handler: async function (argv) {
        argv = argv as Argv;
        await copy(argv.context, argv.bin);
    },
};
