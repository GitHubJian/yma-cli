import yargs from 'yargs';
import devCmd from 'yma-cli-dev';
import buildCmd from 'yma-cli-build';
import copyCmd from 'yma-cli-copy';
import ipCmd from 'yma-cli-ip';

export default function (argv: string[]) {
    const globalOptions = {};

    const cli = yargs(argv, process.cwd())
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

            yargs.exit(actual!.exitCode > 0 ? actual.exitCode : 1, actual);
        })
        .alias('h', 'help')
        .alias('v', 'version')
        .wrap(yargs.terminalWidth())
        .epilogue('For more information, find our manual at ');

    return cli
        .command(devCmd)
        .command(buildCmd)
        .command(copyCmd)
        .command(ipCmd)
        .parse(argv);
}
