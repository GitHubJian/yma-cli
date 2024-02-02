import path from 'path';
import {log, error, info} from 'yma-shared-util';
import {getVersion, createNextVersion, updateVersion} from './version';
import {build, save, getLocalVersions} from './execa';
import readPkg from './read-pkg';

export default function main({type, cwd}) {
    info('构建中 ...\n', '[Docker]: ');

    let name = 'output';
    try {
        const pkg = readPkg<{name: string}>(cwd);
        name = pkg.name;
    } catch (err) {
        error(err as Error, '[Docker]: ');
    }

    const filepath = path.resolve(cwd, 'Dockerfile');

    const localVersions = getLocalVersions(name);
    let version = '';
    if (localVersions.length > 0) {
        const localVersion = localVersions.pop() as string;
        version = localVersion;
    } else {
        const fileVersion = getVersion(filepath);
        version = fileVersion;
    }

    // 如果 version 为 '' 则是第一次使用，直接将使用 1.0.0 版本
    const nextVersion = createNextVersion(version, type);
    updateVersion(filepath, nextVersion);

    build(name, nextVersion, {
        cwd,
    });

    save(name, nextVersion, {cwd});

    log('构建完成', '[Docker]: ');
}
