import path from 'path';
import {ESLint} from 'eslint';
import chalk from 'chalk';
import table from 'text-table';

import isDir from '../util/is-dir';
import findFiles from '../util/find-files';
import stripAnsi from '../util/strip-ansi';

function translateOptions(configPath) {
    const global = [
        // browser
        'window',
        'document',
        // unit test
        'jest',
        'describe',
        'it',
        'expect',
        'beforeEach',
        'afterEach',
        // commonjs
        'require',
        'module',
        'exports',
        // node
        'global',
        'process',
        '__dirname',
        '__filename',
    ];

    return {
        allowInlineConfig: true,
        cache: false,
        errorOnUnmatchedPattern: false,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        fix: true,
        ignore: true,
        ignorePath: path.resolve(__dirname, '../../public/.eslintignore'),
        overrideConfig: {
            globals:
                global &&
                global.reduce((obj, name) => {
                    if (name.endsWith(':true')) {
                        obj[name.slice(0, -5)] = 'writable';
                    } else {
                        obj[name] = 'readonly';
                    }
                    return obj;
                }, {}),
        },
        overrideConfigFile: configPath,
        useEslintrc: false,
    };
}

function classify(paths): {
    [key: string]: string[];
} {
    const extnames = ['.js', '.ts', '.tsx', '.vue'];

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

    const filepathsMap = {};
    for (let i = 0, len = allFilepaths.length; i < len; i++) {
        const filepath = allFilepaths[i];

        const extname = path.extname(filepath);

        filepathsMap[extname] = filepathsMap[extname] || [];
        filepathsMap[extname].push(filepath);
    }

    return filepathsMap;
}

function resolveOptionsPath(extname) {
    if (extname === '.js') {
        return require.resolve('./options/js');
    }

    if (extname === '.tsx') {
        return require.resolve('./options/tsx');
    }

    if (extname === '.ts') {
        return require.resolve('./options/ts');
    }

    if (extname === '.vue') {
        return require.resolve('./options/vue');
    }
}

async function lint(files, extname) {
    const optionsPath = resolveOptionsPath(extname);

    const opts = translateOptions(optionsPath);
    const engine = new ESLint(opts);

    const results: ESLint.LintResult[] = await engine.lintFiles(files);

    return results;
}

export function countErrors(results: ESLint.LintResult[]): {
    errorCount: number;
    warningCount: number;
} {
    let errorCount = 0;
    let warningCount = 0;

    for (const result of results) {
        errorCount += result.errorCount;
        warningCount += result.warningCount;
    }

    return {
        errorCount,
        warningCount,
    };
}

function pathRelative(cwd, filepath) {
    return path.relative(cwd, filepath);
}

export function formatLog(results: ESLint.LintResult[], cwd: string): string {
    let output = '\n';
    let errorCount = 0;
    let warningCount = 0;

    results.forEach(result => {
        const messages = result.messages;

        if (messages.length === 0) {
            return;
        }

        errorCount += result.errorCount;
        warningCount += result.warningCount;

        const filepath = pathRelative(cwd, result.filePath);

        output += `${chalk.underline(filepath)}\n`;

        output += `${table(
            messages.map(message => {
                let messageType;

                if (message.fatal || message.severity === 2) {
                    messageType = chalk.red('error');
                } else {
                    messageType = chalk.yellow('warning');
                }

                return [
                    '',
                    message.line || 0,
                    message.column || 0,
                    messageType,
                    message.message.replace(/([^ ])\.$/u, '$1'),
                    chalk.dim(message.ruleId || ''),
                ];
            }),
            {
                align: ['', 'r', 'l'],
                stringLength(str) {
                    return stripAnsi(str).length;
                },
            },
        )
            .split('\n')
            .map(el => el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => chalk.dim(`${p1}:${p2}`)))
            .join('\n')}\n\n`;
    });

    const total = errorCount + warningCount;

    return total > 0 ? chalk.reset(output) : '';
}

export default async function (filepaths: string[], cwd: string): Promise<ESLint.LintResult[]> {
    const maps = classify(filepaths);
    const keys = Object.keys(maps);
    const results: ESLint.LintResult[] = [];

    for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const currentFilepaths = maps[key];

        const curerntResults = await lint(currentFilepaths, key);
        await ESLint.outputFixes(curerntResults);

        results.push(...curerntResults);
    }

    return results;
}
