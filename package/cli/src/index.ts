import yargs from 'yargs';
import execa from 'execa';
import glob from 'glob';
import buildCmd from 'yma-cli-build';
import copyCmd from 'yma-cli-copy';
import devCmd from 'yma-cli-dev';
import envCmd from 'yma-cli-env';
import ipCmd from 'yma-cli-ip';
import lintCmd from 'yma-cli-lint';
import nsrCmd from 'yma-cli-nsr';

const prefix = 'yma-cli';

export default function (argv: string[]) {
    const globalOptions = {};

    let cli = yargs(argv, process.cwd())
        .options(globalOptions)
        .usage('Usage: $0 <command> [options]')
        .demandCommand(
            1,
            'A command is required. Pass --help to see all available commands and options.'
        )
        .recommendCommands()
        .strict()
        .fail((msg, err) => {
            const actual =
                (err as {
                    name: string;
                    message: string;
                    exitCode: number;
                }) || new Error(msg);

            yargs.exit(actual.exitCode > 0 ? actual.exitCode : 1, actual);
        })
        .alias('h', 'help')
        .alias('v', 'version')
        .wrap(yargs.terminalWidth())
        .epilogue('For more information, find our manual at ');

    const customPlugins = findGlobalPlugins(['dev', 'build', 'lint']);
    const buildinPlugins = [devCmd, buildCmd, lintCmd];

    const allPlugins = buildinPlugins.concat(customPlugins);

    allPlugins.forEach(plugin => {
        cli = cli.command(plugin);
    });

    return cli.parse(argv);
}

function findGlobalPlugins(ignores: Array<string>): Array<{
    command: string;
    describe: string;
    builder: (yargs: any) => any;
    handler: (argv: any) => Promise<void>;
}> {
    const {stdout} = execa.sync('npm', ['config', 'get', 'prefix']);

    const dir = `${stdout}/lib/node_modules/`;
    const pattern = dir + `${prefix}-*`;
    const list = glob.sync(pattern);

    return list
        .filter(function (p) {
            // 忽略重复安装项
            const id = p.substring(dir.length).replace(`${prefix}-`, '');

            return !ignores.includes(id);
        })
        .map(function (p) {
            return require(p);
        });
}
