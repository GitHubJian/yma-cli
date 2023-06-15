import rules from './rules';

export = {
    extends: [],
    ignoreFiles: ['node_modules/**', 'dist/**', 'coverage/**', 'output/**'],
    plugins: ['stylelint-order'],
    rules: rules,
};
