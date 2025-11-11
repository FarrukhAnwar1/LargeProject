export default {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/__tests__/**/*.test.js'],
    transform: {},
    moduleNameMapper: {
        '^(.*)/resend/email\\.js$': '<rootDir>/__mocks__/email.mock.js'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        'models/**/*.js',
        '!src/**/*.test.js',
        '!src/config/**/*.js',
        '!**/node_modules/**',
    ],
    verbose: true
};