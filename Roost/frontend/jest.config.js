/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: '<rootDir>/jest.environment.js',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'mjs', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!\\.pnpm|(?:.+/)?(?:msw|@mswjs|@bundled-es-modules|until-async|headers-polyfill|outvariant|strict-event-emitter|uuid|@testing-library|tough-cookie|@tanstack|tslib|@angular|rxjs)(?:/|$)|.+\\.mjs$)',
  ],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};
