import PluginAPI from 'yma-config-plugin';
import dev from './dev';

const options = {
    command: 'dev',
    describe: 'Webpack Development 模式构建',
    builder: function builder(yargs) {
        process.env.NODE_ENV = 'development';

        yargs.options('mock', {
            type: 'string',
            description: '传入 MockData 文件夹路径',
            default: 'mock',
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
            api
        );
    },
};

export = options;
