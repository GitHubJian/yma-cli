import {chalk} from 'yma-shared-util';
import prettier from './prettier';
import eslint, {formatLog as formatESLintLog, countErrors as countESLintErrors} from './eslint';
import stylelint, {formatLog as formatStylelintLog, countErrors as countStylelintErrors} from './stylelint';

function formatSummaryLog(errorCount, warningCount) {
    function pluralize(word, count) {
        return count === 1 ? word : `${word}s`;
    }

    let output = '';
    const total = errorCount + warningCount;

    const summaryColor = 'red';
    if (total > 0) {
        output += chalk[summaryColor].bold(
            [
                '\u2716 ',
                total,
                pluralize(' problem', total),
                ' (',
                errorCount,
                pluralize(' error', errorCount),
                ', ',
                warningCount,
                pluralize(' warning', warningCount),
                ')\n',
            ].join(''),
        );
    }

    return total > 0 ? chalk.reset(output) : '';
}

export default async function main(paths, cwd) {
    console.log('格式化...');
    prettier(paths, cwd);

    const eslintResults = await eslint(paths, cwd);
    const {errorCount: eslintErrorCount, warningCount: eslintWarningCount} = countESLintErrors(eslintResults);

    const stylelintResult = await stylelint(paths, cwd);
    const {errorCount: stylelintErrorCount, warningCount: stylelintWarningCount} =
        countStylelintErrors(stylelintResult);

    const summaryLog = formatSummaryLog(
        eslintErrorCount + stylelintErrorCount,
        eslintWarningCount + stylelintWarningCount,
    );

    console.log(summaryLog);

    const eslintLog = formatESLintLog(eslintResults, cwd);
    const stylelintLog = formatStylelintLog(stylelintResult, cwd);

    console.log(eslintLog);
    console.log(stylelintLog);
}
