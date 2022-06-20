import type { InstallGeneratorOptions } from '../schema';
import { npmAccess } from '../../../core';

export function normalizeOptions(
  rawOptions: InstallGeneratorOptions
): InstallGeneratorOptions {
  return {
    ...rawOptions,
    access: rawOptions.access || npmAccess.public,
  };
}
