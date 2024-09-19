import os from 'os';
import path from 'path';
import yargs from 'yargs';
import execa from 'execa';
import glob from 'glob';

import dev from 'yma-cli-dev';
import build from 'yma-cli-build';

const prefix = 'yma-cli';

function isWindows() {
    return process.platform === 'win32';
}

function findGlobalPlugins(ignores: string[]): Array<{
    command: string;
    describe: string;
    builder: (yargs: any) => any;
    handler: (argv: any) => Promise<void>;
}> {
    const {stdout} = execa.sync('npm', ['config', 'get', 'prefix'], {
        cwd: os.homedir(),
    });

    const globalDir = isWindows() ? path.resolve(stdout, 'node_modules') : path.resolve(stdout, 'lib', 'node_modules');
    const currentDir = path.resolve(process.cwd(), 'node_modules');
    const nodeModulesDir = [currentDir, globalDir];

    const list = nodeModulesDir
        .map(function (dir) {
            const pattern = dir + path.sep + `${prefix}-*`;
            const currentList = glob.sync(pattern);
            return currentList;
        })
        .reduce(function (prev, cur) {
            prev.push(...cur);
            return prev;
        }, []);

    const installedModules = list.filter(function (p) {
        // 忽略重复安装项
        const pPairs = p.split('/');
        const foldername = pPairs.pop() || '';
        const id = foldername.replace(`${prefix}-`, '');

        return !ignores.includes(id);
    });

    return Array.from(new Set(installedModules)).map(function (p) {
        return require(p);
    });
}

export default function (argv: string[]) {
    const globalOptions = {};

    let cli = yargs(argv, process.cwd())
        .options(globalOptions)
        .usage('Usage: $0 <command> [options]')
        .demandCommand(1, 'A command is required. Pass --help to see all available commands and options.')
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

    const customPlugins = findGlobalPlugins(['dev', 'build']);
    const buildinPlugins = [dev, build];
    const allPlugins = buildinPlugins.concat(customPlugins);

    allPlugins.forEach(plugin => {
        cli = cli.command(plugin);
    });

    return cli.parse(argv);
}
