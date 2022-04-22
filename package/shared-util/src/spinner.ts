import ora from 'ora';
import chalk from 'chalk';

const spinner = ora();
let lastMsg: null | Record<string, any>;
let isPaused = false;

export function logWithSpinner(symbol: string, msg: string = ''): void {
    if (!msg) {
        msg = symbol;
        symbol = chalk.green('✔');
    }

    if (lastMsg) {
        spinner.stopAndPersist({
            symbol: lastMsg.symbol,
            text: lastMsg.text,
        });
    }
    spinner.text = ' ' + msg;
    lastMsg = {
        symbol: symbol + ' ',
        text: msg,
    };
    spinner.start();
}

export function stopSpinner(persist: boolean): void {
    if (lastMsg && persist !== false) {
        spinner.stopAndPersist({
            symbol: lastMsg.symbol,
            text: lastMsg.text,
        });
    } else {
        spinner.stop();
    }

    lastMsg = null;
}

export function pauseSpinner(): void {
    if (spinner.isSpinning) {
        spinner.stop();
        isPaused = true;
    }
}

export function resumeSpinner(): void {
    if (isPaused) {
        spinner.start();
        isPaused = false;
    }
}

export function failSpinner(text?: string): void {
    spinner.fail(text);
}
