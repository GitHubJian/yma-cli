import main from './main';

export = {
    command: 'nsr',
    describe: '切换 npm 的 registry',
    builder: function builder(yargs) {
        return yargs;
    },
    handler: async function () {
        await main(process.cwd());
    },
};
