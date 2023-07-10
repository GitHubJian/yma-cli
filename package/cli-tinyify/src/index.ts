import main from './main';

function commaSeparatedList(value: string) {
    return value.split(',').map(v => v.trim());
}

export = {
    command: 'tiny',
    describe: 'TinyPNG 压缩图片',
    builder: function builder(yargs) {
        yargs.options('folders', {
            type: 'string',
            description: '压缩当前文件夹中图片，以逗号分割',
            default: 'src',
        });

        return yargs;
    },
    handler: async function (argv) {
        const cwd = process.cwd();
        const folders = commaSeparatedList(argv.folders);

        await main({
            cwd,
            folders: folders,
        });
    },
};
