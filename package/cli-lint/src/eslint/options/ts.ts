export = {
    extends: ['./base/index', './base/import', './base/ts'],
    rules: {
        '@typescript-eslint/no-explicit-any': [2],
        'import/no-unresolved': 1,
        'import/no-useless-path-segments': [2, {noUselessIndex: true}],
    },
};
