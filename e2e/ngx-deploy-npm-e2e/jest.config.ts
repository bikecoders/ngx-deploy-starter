export default {
  displayName: 'ngx-deploy-npm-e2e',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/e2e/ngx-deploy-npm-e2e',
  testPathIgnorePatterns: ['/node_modules/', 'integration/.*'],
};
