import fs from 'fs';
import path from 'path';

export default function readPkg<T>(projectDir: string): T {
    const filepath = path.join(projectDir, 'package.json');

    let pkg;
    try {
        pkg = fs.readFileSync(filepath, 'utf-8');
    } catch (err) {
        throw new Error(`The package.json file at '${filepath}' does not exist`);
    }

    try {
        pkg = JSON.parse(pkg);
    } catch (err) {
        throw new Error('The package.json is malformed');
    }

    return pkg;
}
