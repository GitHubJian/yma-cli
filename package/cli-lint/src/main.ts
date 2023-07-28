import {chalk, log} from 'yma-shared-util';
import {table} from 'table';
import prettier from './prettier';
import eslint, {formatLog as formatESLintLog, countErrors as countESLintErrors} from './eslint';
import stylelint, {formatLog as formatStylelintLog, countErrors as countStylelintErrors} from './stylelint';

interface IPrintCount {
    errors: number;
    warnings: number;
}

function print(eslintCount: IPrintCount, stylelintCount: IPrintCount) {
    const data = [
        ['', 'Error Count', 'Warn Count'],
        ['ESLint', chalk.red(eslintCount.errors), chalk.yellow(eslintCount.warnings)],
        ['StyleLint', chalk.red(stylelintCount.errors), chalk.yellow(stylelintCount.warnings)],
    ];

    const config = {
        columnDefault: {
            width: 20,
        },
        header: {
            alignment: 'center',
            content: '本次格式化内容如下',
        },
    };
    // @ts-ignore
    console.log(table(data, config));
}

export default async function main(paths, cwd) {
    log('Prettier ...', '[YMA Lint]');
    prettier(paths, cwd);

    log('ESLint ...', '[YMA Lint]');
    const eslintResults = await eslint(paths, cwd);
    const {errorCount: eslintErrorCount, warningCount: eslintWarningCount} = countESLintErrors(eslintResults);

    log('StyleLint ...', '[YMA Lint]');
    const stylelintResult = await stylelint(paths, cwd);
    const {errorCount: stylelintErrorCount, warningCount: stylelintWarningCount} =
        countStylelintErrors(stylelintResult);

    prettier(paths, cwd);

    print(
        {
            errors: eslintErrorCount,
            warnings: eslintWarningCount,
        },
        {
            errors: stylelintErrorCount,
            warnings: stylelintWarningCount,
        },
    );

    const eslintLog = formatESLintLog(eslintResults, cwd);
    const stylelintLog = formatStylelintLog(stylelintResult, cwd);

    console.log(eslintLog);
    console.log(stylelintLog);
}
