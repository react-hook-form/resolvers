module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  restoreMocks: true,
  testMatch: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  testPathIgnorePatterns: ['/__fixtures__/', '/\\.'],
  moduleNameMapper: {
    '^@hookform/resolvers$': '<rootDir>/src',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
