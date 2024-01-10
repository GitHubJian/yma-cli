import PluginAPI from 'yma-config-plugin';
import dev from './dev';

const options = {
    command: 'dev',
    describe: 'Webpack Development 模式构建',
    builder: function builder(yargs) {
        process.env.NODE_ENV = 'development';

        yargs.options('mock', {
            type: 'boolean',
            description: '是否启用本地 Mock 服务',
            default: false,
        });

        return yargs;
    },
    handler: async function (argv) {
        const api = new PluginAPI(process.cwd(), 'development', {
            config: argv.config,
        });

        await dev(
            {
                mock: argv.mock,
            },
            api,
        );
    },
};

export = options;
