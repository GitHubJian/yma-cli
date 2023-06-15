export = {
    extends: [
        '@ecomfe/eslint-config',
        '@ecomfe/eslint-config/import',
        '@ecomfe/eslint-config/typescript',
        '@ecomfe/eslint-config/react',
    ],
    parserOptions: {
        project: './**/tsconfig.json',
    },
    rules: {
        'react/jsx-indent': [
            2,
            4,
            {
                checkAttributes: false,
                indentLogicalExpressions: true,
            },
        ],
        'react/jsx-no-bind': [
            'warn',
            {
                ignoreDOMComponents: true,
                ignoreRefs: false,
                allowArrowFunctions: true,
                allowFunctions: true,
                allowBind: false,
            },
        ],
        'react/jsx-indent-props': [
            2,
            {
                indentMode: 4,
                ignoreTernaryOperator: true,
            },
        ],
        'react/jsx-wrap-multilines': [
            2,
            {
                declaration: 'parens-new-line',
                assignment: 'parens-new-line',
                return: 'parens-new-line',
                arrow: 'parens-new-line',
                condition: 'parens-new-line',
                logical: 'parens-new-line',
                prop: 'parens-new-line',
            },
        ],
        '@typescript-eslint/no-explicit-any': [2],
        'import/no-unresolved': [0],
        'import/no-useless-path-segments': [2, {noUselessIndex: true}],
        'import/named': [1],
    },
};
