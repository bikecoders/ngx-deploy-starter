import { runNxCommand } from '@nx/plugin/testing';

type Options = {
  nxPlugin: string;
  libName: string;
  extraOptions?: string;
  generator?: string;
  setPublishableOption?: boolean;
};

export function generateLib({
  nxPlugin,
  libName,
  extraOptions,
  generator = 'lib',
  setPublishableOption = true,
}: Options) {
  const publishableOption = setPublishableOption ? '--publishable' : '';
  const extraOptionsNormalized = extraOptions ? extraOptions : '';

  runNxCommand(
    `generate ${nxPlugin}:${generator} --name ${libName} ${publishableOption} --importPath ${libName} ${extraOptionsNormalized}`
  );
}
