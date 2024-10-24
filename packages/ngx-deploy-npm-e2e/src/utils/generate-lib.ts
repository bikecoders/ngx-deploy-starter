type Options = {
  nxPlugin: string;
  libName: string;
  executeCommand: (command: string) => void;
  extraOptions?: string;
  generator?: string;
  setPublishableOption?: boolean;
};

export function generateLib({
  nxPlugin,
  libName,
  executeCommand,
  extraOptions,
  generator = 'lib',
  setPublishableOption = true,
}: Options) {
  const publishableOption = setPublishableOption ? '--publishable' : '';
  const extraOptionsNormalized = extraOptions ? extraOptions : '';

  executeCommand(
    `npx nx generate ${nxPlugin}:${generator} --name ${libName} ${publishableOption} --importPath ${libName} ${extraOptionsNormalized}`
  );
}
