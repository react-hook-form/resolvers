module.exports = {
  preset: 'ts-jest',
  restoreMocks: true,
  testMatch: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleNameMapper: {
    '^@hookform/resolvers$': '<rootDir>/src',
  },
};
