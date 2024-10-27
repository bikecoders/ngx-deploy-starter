import { readJson } from '@nx/plugin/testing';

export const currentNxVersion = readJson(`${process.cwd()}/package.json`)
  .devDependencies['@nx/workspace'];
