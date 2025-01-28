import type { Config } from 'jest'

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        // Handle CSS imports
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        // Handle CSS modules
        '\\.css\\?inline$': '<rootDir>/tests/setup/mocks/cssMock.ts'
    },
    setupFiles: ['<rootDir>/tests/setup/jest.setup.ts'],
    testMatch: [    '<rootDir>/tests/**/*.test.ts'
    ],
    coverageDirectory: 'coverage'
}

export default config