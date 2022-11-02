import * as fs from '../utils/file-utils';
import { setPackageVersion } from './set-package-version';

describe('setPackageVersion', () => {
  let myPackageJSON: Record<string, unknown>;
  let expectedPackage: Record<string, unknown>;
  let version: string;
  let dir: string;

  let valueWriten: Parameters<typeof fs.writeFileAsync>[1];

  // Spies
  beforeEach(() => {
    jest
      .spyOn(fs, 'readFileAsync')
      .mockImplementation(() => Promise.resolve(JSON.stringify(myPackageJSON)));

    jest.spyOn(fs, 'writeFileAsync').mockImplementation((_, data) => {
      valueWriten = data;
      return Promise.resolve();
    });
  });

  // Data
  beforeEach(() => {
    version = '1.0.1-next0';
    dir = 'some/random/dir';

    myPackageJSON = {
      name: 'ngx-deploy-npm',
      version: 'boilerPlate',
      description: 'Publish your libraries to NPM with just one command',
      main: 'index.js',
    };

    expectedPackage = {
      ...myPackageJSON,
      version,
    };
  });

  it('should write the version of the sent on the package.json', async () => {
    await setPackageVersion(dir, version);

    expect(valueWriten).toEqual(JSON.stringify(expectedPackage, null, 4));
  });
});
