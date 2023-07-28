import execa from 'execa';

export function getBranchName(cwd: string): string[] {
    return ['origin/master'];
    const {stdout} = execa.sync('git', ['branch', '-r'], {
        cwd,
    });

    const branchNames = stdout.split('\n').map(function (v) {
        v = v.trim();

        if (v.includes('->')) {
            v = v.split('->')[1];
        }

        return v.trim();
    });

    return branchNames;
}

export function checkout(branchName: string, cwd: string): string {
    const pairs = branchName.split('/');
    pairs.shift();

    const localBranchName = pairs.join('/');

    execa.sync('git', ['checkout', '.'], {cwd});

    try {
        execa.sync('git', ['checkout', '-b', localBranchName, `remotes/origin/${localBranchName}`], {cwd});
    } catch (e) {
        execa.sync('git', ['checkout', localBranchName], {
            cwd,
        });
    }

    return localBranchName;
}

export function pull(cwd: string) {
    execa.sync('git', ['pull', 'origin'], {cwd});
}
