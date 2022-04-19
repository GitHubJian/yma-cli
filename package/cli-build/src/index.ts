export = {
    command: 'build',
    describe: 'Webpack Production 模式构建',
    builder: function builder(yargs) {
        process.env.NODE_ENV = 'production';

        return yargs;
    },
    handler: async function (argv) {
        console.log('hello, build');
    },
};
