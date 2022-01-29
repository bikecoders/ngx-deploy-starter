module.exports = {
  displayName: 'ngx-deploy-npm',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/ngx-deploy-npm',
  coverageReporters: [['lcov', { projectRoot: 'packages/ngx-deploy-npm' }]],
};
