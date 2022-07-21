import PluginAPI from 'yma-config-plugin';
import dev from './dev';

export = {
    command: 'dev',
    describe: 'Webpack Development 模式构建',
    builder: function builder(yargs) {
        process.env.NODE_ENV = 'development';

        return yargs;
    },
    handler: async function (argv) {
        const api = new PluginAPI(process.cwd(), 'development', {
            config: argv.config,
        });

        await dev({}, api);
    },
};
