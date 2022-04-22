import chalk from 'chalk';
import stripAnsi from './strip-ansi';

const format = (label: string, msg: string): string => {
    return msg
        .split('\n')
        .map((line, i) => {
            return i === 0
                ? `${label} ${line}`
                : line.padStart(stripAnsi(label).length);
        })
        .join('\n');
};

const chalkTag = function (msg: string): string {
    return chalk.bgBlackBright.white.dim(` ${msg} `);
};

export function log(msg: string = '', tag = ''): void {
    tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg);
}

export function info(msg: string, tag = ''): void {
    console.log(
        format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg)
    );
}

export function done(msg: string, tag: string = ''): void {
    console.log(
        format(chalk.bgGreen.black(' DONE ') + (tag ? chalkTag(tag) : ''), msg)
    );
}

export function warn(msg: string, tag: string = ''): void {
    console.warn(
        format(
            chalk.bgYellow.black(' WARN ') + (tag ? chalkTag(tag) : ''),
            chalk.yellow(msg)
        )
    );
}

export function error(msg: Error | string, tag: string = ''): void {
    console.error(
        format(
            chalk.bgRed(' ERROR ') + (tag ? chalkTag(tag) : ''),
            chalk.red(msg)
        )
    );

    if (msg instanceof Error) {
        console.error(msg.stack);
    }
}
