import { runNxCommand } from '@nrwl/nx-plugin/testing';

export function generateLib(
  nxPlugin: string,
  libName: string,
  extraOptions?: string,
  generator = 'lib',
  setPublishableOption = true
) {
  beforeEach(() => {
    runNxCommand(
      `generate ${nxPlugin}:${generator} --name ${libName} ${
        setPublishableOption ? '--publishable' : ''
      } --importPath ${libName} ${extraOptions || ''}`
    );
  }, 120000);
}
