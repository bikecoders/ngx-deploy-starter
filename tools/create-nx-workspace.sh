#!/bin/bash

set -e

mkdir -p tmp
cd tmp

# Delete the previous workspace
rm -Rif nx-workspace

npx create-nx-workspace --version

echo "Create Nx Workspace"
npx create-nx-workspace --packageManager yarn --name nx-workspace --preset empty  --nxCloud false
cd nx-workspace

echo "Generate lib"
yarn add -D @nrwl/node
npx nx generate @nrwl/node:lib --name nx-lib --publishable --importPath nx-lib

echo "Link ngx-deploy-npm"
yarn link ngx-deploy-npm

echo "Add ngx-deploy-npm to the workspace"
npx nx generate ngx-deploy-npm:install

echo "Test the build"
npx nx deploy nx-lib --dry-run