import fse from 'fs-extra';
import semver from 'semver';
import {log, warn} from 'yma-shared-util';

export function getVersion(filepath: string): string {
    const content = fse.readFileSync(filepath, {encoding: 'utf-8'});

    const lines = content.split('\n').filter(v => v);

    let firstLine = lines[0];
    let version = '1.0.0';
    if (firstLine.indexOf('# version') === 0) {
        let substr = firstLine.substring('# version'.length);
        version = semver.valid(substr);

        if (!/\d+\.\d+\.\d+/.test(version)) {
            throw 'Dockerfile 第一行不符合规范，Version 只支持正式的版本号，比如 1.0.0';
        }

        return version;
    }
    return '';
}

export function createNextVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
    let nextVersion = '1.0.0';

    if (!version) {
        warn(`Dockerfile 中不存在 Version 版本号，将自动更新为 ${version}。\n`, '[Docker]: ');

        return nextVersion;
    }

    const vMajor = semver.major(version);
    const vMinor = semver.minor(version);
    const vPatch = semver.patch(version);

    if (type === 'major') {
        nextVersion = `${vMajor + 1}.0.0`;
    } else if (type === 'minor') {
        nextVersion = `${vMajor}.${vMinor + 1}.0`;
    } else if (type === 'patch') {
        nextVersion = `${vMajor}.${vMinor}.${vPatch + 1}`;
    } else {
        nextVersion = `${vMajor}.${vMinor}.${vPatch + 1}`;
    }

    return nextVersion;
}

export function updateVersion(filepath: string, version: string) {
    const content = fse.readFileSync(filepath, {encoding: 'utf-8'});

    const lines = content.split('\n').filter(v => v);

    let firstLine = lines[0];
    if (firstLine.indexOf('# version') === 0) {
        lines.shift();
        lines.unshift(`# version ${version}\r\n`);
    } else {
        lines.unshift(`# version ${version}\r\n`);
    }

    const newContent = lines
        .filter(v => {
            if (v === '\r' || v === '\r\n') {
                return false;
            }
            return true;
        })
        .join('\n');

    fse.writeFileSync(filepath, newContent, {encoding: 'utf-8'});

    log(`Version(${version}) 更新成功`, '[Docker]: ');
}
