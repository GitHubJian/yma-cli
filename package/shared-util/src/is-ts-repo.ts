import fs from 'fs';
import path from 'path';

export function isTSRepo(cwd: string): boolean {
    const tsconfig = path.relative(cwd, 'tsconfig.json');

    return fs.existsSync(tsconfig) && fs.statSync(tsconfig).isFile();
}
