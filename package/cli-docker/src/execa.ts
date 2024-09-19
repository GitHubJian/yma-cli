import execa from 'execa';
import {error} from 'yma-shared-util';

export function build(name: string, version: string, {cwd} = {cwd: '.'}): string {
    const output = execa.sync(`docker build -t ${name}:${version} ${cwd}`, {
        cwd: cwd,
    });

    console.log(output.stdout);

    return output.stdout;
}

export function save(name: string, version: string, {cwd} = {cwd: process.cwd()}): string {
    const output = execa.sync(`docker save -o ${name}-${version}.tar ${name}:${version}`, {
        cwd: cwd,
    });

    console.log(output.stdout);

    return output.stdout;
}

export function getLocalVersions(name, {cwd} = {cwd: process.cwd()}): string[] {
    try {
        const output = execa.sync(`docker images ${name} --format "{{.Tag}}"`, {
            cwd: cwd,
        });

        const {stdout} = output;

        const list = stdout.split('\n');

        return list;
    } catch (e) {
        error(e as Error, '[Docker]: ');

        return [];
    }
}
