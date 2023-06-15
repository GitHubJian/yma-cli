import path from 'path';
import {lint as standalone, LinterResult, LintResult} from 'stylelint';
import findFiles from '../util/find-files';
import isDir from '../util/is-dir';

function classify(paths): string[] {
    const extnames = ['.less', '.css', '.vue'];

    const allFilepaths: string[] = [];
    for (let i = 0, len = paths.length; i < len; i++) {
        const filepath = paths[i];

        if (isDir(filepath)) {
            const currentFilepaths = findFiles(filepath);
            const realCurrentFilepaths = currentFilepaths.filter(function (p) {
                const currentExtname = path.extname(p);

                return extnames.includes(currentExtname);
            });

            allFilepaths.push(...realCurrentFilepaths);
        } else {
            const currentExtname = path.extname(filepath);

            if (extnames.includes(currentExtname)) {
                allFilepaths.push(filepath);
            }
        }
    }

    return allFilepaths;
}

export function countErrors(linterResult: LinterResult): {
    errorCount: number;
    warningCount: number;
} {
    let errorCount = 0;
    let warningCount = 0;
    const results = linterResult.results;

    results.forEach(function (result) {
        if (result.errored) {
            errorCount++;
        }

        warningCount += result.warnings.length;
    });

    return {
        errorCount,
        warningCount,
    };
}

export function formatLog(linterResult: LinterResult, cwd: string) {
    return linterResult.output;
}

export default async function (files, cwd): Promise<LinterResult> {
    const filepaths = classify(files);

    if (filepaths.length === 0) {
        return {
            errored: false,
            output: '',
            results: [],
        };
    }

    const options = {
        formatter: 'string' as 'string',
        config: require('./options/less'),
        files: filepaths,
        globbyOptions: {
            cwd: cwd,
        },
        fix: true,
        configBasedir: __dirname,
    };

    const linterResult = await standalone(options);

    return linterResult;
}
