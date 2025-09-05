module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Most specific patterns FIRST
    '^@/public/locales/(.*)/(.*)\.json$': '<rootDir>/__mocks__/locales.js',
    '^@/i18n/seo.schema$': '<rootDir>/src/i18n/__mocks__/seo.schema.ts',
    '^@/lib/seo-utils$': '<rootDir>/src/lib/__mocks__/seo-utils.ts',

    // Next mocks
    '^next-i18next': '<rootDir>/__mocks__/next-i18next.js',
    '^next/head': '<rootDir>/__mocks__/next-head.js',
    '^next/router': '<rootDir>/__mocks__/next-router.js',
    '^next/config': '<rootDir>/__mocks__/next-config.js',

    // Project aliases (generic) AFTER specifics
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/public/(.*)$': '<rootDir>/public/$1',

    // Static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/tests/',
    '<rootDir>/tests-e2e/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '!**/tests-e2e/**/*.spec.[jt]s?(x)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleDirectories: ['node_modules', 'src'],
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
