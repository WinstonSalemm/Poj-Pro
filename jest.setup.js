// Jest setup file for testing environment
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      return <>{children}</>;
    },
  };
});

// Import next/router for mocking
import * as NextRouter from 'next/router';

// Mock next/router
const useRouter = jest.spyOn(NextRouter, 'useRouter');
useRouter.mockImplementation(() => ({
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Return the key as the translation
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
  appWithTranslation: (component) => component,
  withTranslation: () => (Component) => {
    const WithTranslation = (props) => (
      <Component t={(k) => k} {...props} />
    );
    WithTranslation.displayName = `WithTranslation(${Component.displayName || Component.name || 'Component'})`;
    return WithTranslation;
  },
}));

// Mock next/config
jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  },
}));

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Add TextEncoder and TextDecoder for tests that need them
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console methods to track errors and warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Ignore specific warning about ReactDOM.render being deprecated
    if (args[0] && args[0].includes('ReactDOM.render is no longer supported in React 18')) {
      return;
    }
    // Ignore known SEOContent malformed-content error logs used by edge-case tests
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Error rendering SEO content for section')) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    // Ignore specific warnings
    if (args[0] && 
        (args[0].includes('componentWillReceiveProps') || 
         args[0].includes('componentWillUpdate'))) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';
