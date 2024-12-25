import execa from 'execa';

export function getCurrentBranch(cwd) {
    const {stdout} = execa.sync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
        cwd,
    });

    return stdout.trim();
}

export function getOriginUrl(cwd) {
    const {stdout} = execa.sync('git', ['config', '--get', 'remote.origin.url'], {
        cwd,
    });

    return stdout.trim();
}
