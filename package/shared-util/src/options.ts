import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import {error} from './logger';
import {loadModule} from './module';

export function loadOptions<T>(
    filename: string,
    cwd: string = process.cwd()
): T | null {
    let fileConfig: T | null;

    const possibleConfigPaths: string[] = [filename];
    let fileConfigPath: string;

    for (const p of possibleConfigPaths) {
        const resolvedPath: string = path.resolve(cwd, p);

        if (resolvedPath && fs.existsSync(resolvedPath)) {
            fileConfigPath = resolvedPath;
            break;
        }
    }

    if (fileConfigPath!) {
        try {
            fileConfig = loadModule(fileConfigPath, cwd);

            if (typeof fileConfig === 'function') {
                fileConfig = fileConfig();
            }

            if (!fileConfig || typeof fileConfig !== 'object') {
                fileConfig = null;
            }
        } catch (e) {
            error(`Error loading ${chalk.bold(fileConfigPath)}`);

            throw e;
        }
    }

    return fileConfig!;
}
