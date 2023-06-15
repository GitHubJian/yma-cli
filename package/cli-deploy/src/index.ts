import main from './main';

function commaSeparatedList(value: string): string[] {
    return value.split(',').map(v => v.trim());
}

export = {
    command: 'lint',
    describe: '格式化项目',
    builder: function builder(yargs) {
        yargs.options('paths', {
            type: 'string',
            description: '传入待格式化的文件（夹）路径',
            default: '',
        });

        return yargs;
    },
    handler: async function (argv) {
        const paths = commaSeparatedList(argv.paths || '.');

        await main(paths, process.cwd());
    },
};
