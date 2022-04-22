import PluginAPI from 'yma-config-plugin';
import build from './build';

export = {
    command: 'build',
    describe: 'Webpack Production 模式构建',
    builder: function builder(yargs) {
        process.env.NODE_ENV = 'production';

        return yargs.options('entry', {
            type: 'string',
            description: 'Entry 入口类型(spa|mpa|dll)',
            default: 'mpa',
        });
    },
    handler: async function (argv) {
        const api = new PluginAPI(process.cwd(), 'production', {
            minimize: argv.minimize,
            config: argv.config,
            entry: argv.entry,
        });

        await build(argv, api);
    },
};
