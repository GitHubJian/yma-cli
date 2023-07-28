import lib from './main';

const options = {
    command: 'branch',
    describe: 'Git 自动生成分支',
    builder: function builder(yargs) {
        return yargs;
    },
    handler: async function (argv) {
        await lib(process.cwd());
    },
};

export = options;
