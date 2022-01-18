module.exports = {
  preset: 'ts-jest',
  restoreMocks: true,
  testMatch: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  testPathIgnorePatterns: ['/__fixtures__/', '/\\.'],
  moduleNameMapper: {
    '^@hookform/resolvers$': '<rootDir>/src',
  },
};
