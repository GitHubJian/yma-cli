import fs from 'fs';
import path from 'path';
import {Filetype} from './gen';

export function isTSRepo(rootDir: string): boolean {
    const filename = 'tsconfig.json';

    const tsconfigFilePath = path.relative(rootDir, filename);

    return fs.existsSync(tsconfigFilePath) && fs.statSync(tsconfigFilePath).isFile();
}

function _upperFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

export function camelCase(str: string): string {
    const camelizeRE = /-(\w)/g;
    return str.replace(camelizeRE, function (_, c) {
        return c ? c.toUpperCase() : '';
    });
}

export function pascalCase(str: string): string {
    return _upperFirst(camelCase(str));
}

interface FindExportedFileOptions {
    filetype: Filetype;
    ignore: string[];
}

export function findExportedFile(dir: string, options: FindExportedFileOptions): string[] {
    const ignore = options.ignore || ['_'];
    const extname = `.${options.filetype}`;

    const basename = path.basename(dir);
    const exclude = [basename, 'index'];

    const list = fs
        .readdirSync(dir, {
            withFileTypes: true,
        })
        .filter(function (v) {
            return ignore.every(function (k) {
                return !v.name.startsWith(k);
            });
        })
        .filter(function (v) {
            if (v.isDirectory()) {
                return true;
            }
            const currentExtname = path.extname(v.name);

            if (currentExtname == extname) {
                const basename = path.basename(v.name, extname);

                return !exclude.includes(basename);
            }
            return false;
        })
        .map(function (v) {
            return path.basename(v.name, extname);
        });

    return list;
}
