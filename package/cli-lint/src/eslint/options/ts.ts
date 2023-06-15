export = {
    extends: ['@ecomfe/eslint-config', '@ecomfe/eslint-config/import', '@ecomfe/eslint-config/typescript'],
    rules: {
        '@typescript-eslint/no-explicit-any': [2],
        'import/no-unresolved': 1,
        'import/no-useless-path-segments': [2, {noUselessIndex: true}],
    },
};
