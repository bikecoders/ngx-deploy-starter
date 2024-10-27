/**
 * This script starts a local registry for e2e testing purposes.
 * It is meant to be called in jest's globalSetup.
 */
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { execSync } from 'child_process';

export default async () => {
  // local registry target to run
  const localRegistryTarget = 'bikecoders:local-registry';
  // storage folder for the local registry
  const storage = './tmp/local-registry/storage';

  globalThis.stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: false,
  });

  execSync(
    'npx nx deploy:without-build ngx-deploy-npm --registry=http://localhost:4873 --packageVersion=0.0.0 --tag e2e'
  );
};
