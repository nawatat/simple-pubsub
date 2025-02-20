/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',  // Change to 'jsdom' if testing browser-based code
    roots: ['<rootDir>/src'], // Keep tests organized inside /src
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    testMatch: ['**/__tests__/**/*.spec.ts'],
    clearMocks: true, // Auto-clear mocks before each test
  };