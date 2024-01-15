import * as fileUtils from '../../../utils';
import { setPackageVersion } from './set-package-version';

jest.mock('../../../utils', () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual('../../../utils'),
  };
});

describe('setPackageVersion', () => {
  let myPackageJSON: Record<string, unknown>;
  let expectedPackage: Record<string, unknown>;
  let version: string;
  let dir: string;

  let valueWriten: Parameters<typeof fileUtils.writeFileAsync>[1];

  // Spies
  beforeEach(() => {
    jest
      .spyOn(fileUtils, 'readFileAsync')
      .mockImplementation(() => Promise.resolve(JSON.stringify(myPackageJSON)));

    jest.spyOn(fileUtils, 'writeFileAsync').mockImplementation((_, data) => {
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
