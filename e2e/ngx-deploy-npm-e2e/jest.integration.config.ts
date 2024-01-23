import originalJestConfig from './jest.config';

export default {
  ...originalJestConfig,
  testPathIgnorePatterns: ['/node_modules/', 'tests/.*'],
};
