import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { TextEncoder, TextDecoder } from 'util'
import { jest } from '@jest/globals'

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  // Increase timeout for slow CI environments
  asyncUtilTimeout: 5000,
})

// Global polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock ResizeObserver (used by many Radix UI components)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Mock window.matchMedia (used by responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
})

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn().mockReturnValue(''),
  })),
})

// Mock CSS.supports for CSS-in-JS libraries
Object.defineProperty(global, 'CSS', {
  writable: true,
  value: {
    supports: jest.fn().mockReturnValue(false),
  },
})

// Mock next/navigation for App Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
  usePathname: jest.fn().mockReturnValue('/'),
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn().mockReturnValue((key) => key),
  useLocale: jest.fn().mockReturnValue('en'),
  useMessages: jest.fn().mockReturnValue({}),
  NextIntlClientProvider: ({ children }) => children,
}))

// Mock react-i18next as fallback
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn().mockResolvedValue(undefined),
    },
  }),
  Trans: ({ children }) => children,
  I18nextProvider: ({ children }) => children,
}))

// Mock Lucide React icons to prevent rendering issues
jest.mock('lucide-react', () => {
  const mockIcon = (props) => {
    const { children, ...otherProps } = props || {}
    return React.createElement('svg', {
      'data-testid': 'mock-icon',
      ...otherProps,
    }, children)
  }
  
  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string' && prop.charAt(0) === prop.charAt(0).toUpperCase()) {
        return mockIcon
      }
      return target[prop]
    }
  })
})

// Mock class-variance-authority
jest.mock('class-variance-authority', () => ({
  cva: jest.fn().mockImplementation((base, config) => 
    jest.fn().mockImplementation((...args) => base)
  ),
  cx: jest.fn().mockImplementation((...args) => args.filter(Boolean).join(' ')),
}))

// Mock clsx and tailwind-merge
jest.mock('clsx', () => jest.fn().mockImplementation((...args) => 
  args.filter(Boolean).join(' ')
))

jest.mock('tailwind-merge', () => ({
  twMerge: jest.fn().mockImplementation((...args) => 
    args.filter(Boolean).join(' ')
  ),
}))

// Enhanced console error handler for better debugging
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test utilities
global.React = require('react')

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
