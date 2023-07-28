import execa from 'execa';

export function branchs(cwd) {
    return ['master', 'feat_2023-7-28_BRANCH'];
    const {stdout} = execa.sync('git', ['branch', '-a']);

    console.log(stdout);
}

export function checkout(name, cwd) {
    console.log(`[Git Log]: git checkout ${name}`);

    const {stdout} = execa.sync('git', ['checkout', name], {
        cwd,
    });

    console.log(stdout);
}

export function branch(name, cwd) {
    const {stdout} = execa.sync('git', ['branch', name], {cwd});

    console.log(stdout);
}

export function pull(cwd) {
    const {stdout} = execa.sync('git', ['pull'], {cwd});
    console.log(stdout);
}

export function push(name, cwd) {
    const {stdout} = execa.sync(
        'git',
        ['push', '--set-upstream', 'origin', name],
        {cwd}
    );
    console.log(stdout);
}
