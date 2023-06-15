import fs from 'fs';
import path from 'path';

export default function getPkg(projectPath: string): any {
    const packagePath = path.join(projectPath, 'package.json');

    let packageJson;
    try {
        packageJson = fs.readFileSync(packagePath, 'utf-8');
    } catch (err) {
        throw new Error(`The package.json file at '${packagePath}' does not exist`);
    }

    try {
        packageJson = JSON.parse(packageJson);
    } catch (err) {
        throw new Error('The package.json is malformed');
    }

    return packageJson;
}
