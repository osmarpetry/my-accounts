// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
  ],
  
  // Module name mapping for assets and CSS
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
    "^uuid$": require.resolve("uuid"),
  },

  // Coverage configuration for 100% target on UI components only
  collectCoverage: false, // Enable only when running coverage command
  collectCoverageFrom: [
    "src/components/ui/**/*.{ts,tsx}",
    "!src/components/ui/**/*.d.ts",
    "!src/components/ui/**/*.stories.{ts,tsx}",
    "!src/components/ui/**/*.config.{ts,tsx}",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    "src/components/ui/**/*.{ts,tsx}": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",

  // Test patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // Transform configuration
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  // Setup for testing environment
  testTimeout: 10000,
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
