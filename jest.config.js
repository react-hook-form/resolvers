module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  restoreMocks: true,
  testMatch: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleNameMapper: {
    '^@hookform/resolvers$': '<rootDir>/src',
  },
};
