import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import isDir from '../util/is-dir';
import findFiles from '../util/find-files';
import options from './options';

const Parser = {
    '.html': 'html',
    '.ejs': 'html',
    '.js': 'babel',
    '.json': 'json',
    '.md': 'markdown',
    '.conf': 'nginx',
    '.ts': 'typescript',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.jsx': 'babel', // for react.jsx
};

const Extnames = Object.keys(Parser);

function format(filepath): null | Error {
    try {
        const extname = path.extname(filepath);
        if (!Extnames.includes(extname)) {
            return null;
        }

        const content = fs.readFileSync(filepath, 'utf-8');

        const realOptions = {
            ...options,
            parser: Parser[extname],
            ignorePath: path.resolve(__dirname, '../../public/.prettierignore'),
        };

        if (extname === '.conf') {
            realOptions.plugins = realOptions.plugins || [];

            // @ts-ignore
            realOptions.plugins.push(require.resolve('../../public/plugin/ng.js'));
        }

        const newCotent = prettier.format(content, realOptions);

        fs.writeFileSync(filepath, newCotent, 'utf-8');

        return null;
    } catch (e) {
        return e as Error;
    }
}

function formats(filepaths: string[]): Error[] {
    const errors: Error[] = [];

    for (let i = 0, len = filepaths.length; i < len; i++) {
        let filepath = filepaths[i];

        const err = format(filepath);

        err && errors.push(err);
    }

    return errors;
}

export default function (filepaths: string[], cwd: string): Error[] {
    const errors: Error[] = [];

    for (let i = 0, len = filepaths.length; i < len; i++) {
        const filepath = filepaths[i];
        const exists = fs.existsSync(filepath);

        if (exists) {
            if (isDir(filepath)) {
                const currentFilepaths = findFiles(filepath);

                const currentErrors = formats(currentFilepaths);

                errors.push(...currentErrors);
            } else {
                const err = format(filepath);
                err && errors.push(err);
            }
        }
    }

    return errors;
}
