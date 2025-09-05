module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/components/seo/**/*.{ts,tsx}',
    'src/i18n/seo/**/*.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/*.d.ts',
    '!**/types.ts',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover',
    'html',
    'cobertura'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    },
    'src/components/seo/**/*.tsx': {
      branches: 85,
      functions: 90,
      lines: 95,
      statements: 95
    }
  },
  // Add any additional configuration needed for your tests
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/public/(.*)$': '<rootDir>/public/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/public/',
    '/coverage/',
    '/.storybook/',
    '\.stories\\.(js|jsx|ts|tsx)$',
    '/tests-e2e/',
    '/cypress/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true
    }
  },
  // Add this if you want to collect coverage from specific files only
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
    '<rootDir>'
  ],
  // Add this to include TypeScript files in the coverage report
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ]
};
