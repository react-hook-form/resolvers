module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  restoreMocks: true,
  testMatch: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
  testPathIgnorePatterns: ['/__fixtures__/'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleNameMapper: {
    '^@hookform/resolvers$': '<rootDir>/src',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
