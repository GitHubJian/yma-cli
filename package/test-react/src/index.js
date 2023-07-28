module.exports = {
    verbose: true,
    testEnvironment: 'jsdom',
    setupFiles: [require.resolve('./setup.js')],
    setupFilesAfterEnv: [require.resolve('./setup-after-env.js')],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    modulePathIgnorePatterns: [],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '/\\.(css|less)$/': 'identity-obj-proxy',
    },
    testPathIgnorePatterns: ['/node_modules/'],
    transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest'),
        '\\.jsx?$': require.resolve('./transformer/babel-jest'),
    },
    testMatch: ['<rootDir>/test/**/*.spec.{ts,tsx}'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    coverageDirectory: '<rootDir>/coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    transformIgnorePatterns: ['/node_modules/'],
    globals: {
        'ts-jest': {
            // babelConfig: require('./babel.config'),
            babelConfig: false,
            tsconfig: require.resolve('./tsconfig.test.json'),
        },
    },
    // globalSetup: path.resolve(__dirname, './setup.js'),
    testEnvironmentOptions: {
        url: 'http://localhost',
    },
};
