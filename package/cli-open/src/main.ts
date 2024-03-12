import execa from 'execa';
import {error, log} from 'yma-shared-util';

function isWindows() {
    return process.platform === 'win32';
}

function isMacOS() {
    return process.platform === 'darwin';
}

export default function open() {
    log('正在打开文件夹...', '[Open]');
    log();

    let stdout, stderr;
    if (isWindows()) {
        const res = execa.sync('explorer', ['.']);
        stdout = res.stdout;
        stderr = res.stderr;
    } else if (isMacOS()) {
        const res = execa.sync('open', ['.']);
        stdout = res.stdout;
        stderr = res.stderr;
    }

    if (stderr) {
        error('打开文件夹失败', '[Open]');
    } else {
        log('打开文件夹成功', '[Open]');
    }
}
