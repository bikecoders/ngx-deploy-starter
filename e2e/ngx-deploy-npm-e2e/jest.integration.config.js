const originalJestConfig = require('./jest.config');

module.exports = {
  ...originalJestConfig,
  testPathIgnorePatterns: ['/node_modules/', 'tests/.*'],
};
