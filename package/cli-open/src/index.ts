import main from './main';

export = {
    command: 'open',
    describe: '打开资源管理器',
    builder: function builder(yargs) {
        return yargs;
    },
    handler: async function () {
        try {
            main();
        } catch (e) {
            console.error(e);
        }
    },
};
