#!/bin/bash

set -e

version="${1:-latest}"

mkdir -p tmp
cd tmp

# Delete the previous workspace
rm -Rif nx-workspace

npx --yes create-nx-workspace@$version --version

echo "----- Create Nx Workspace -----"
npx create-nx-workspace@$version --name nx-workspace --preset npm --nxCloud false
cd nx-workspace

echo "NX_WORKSPACE_ROOT_PATH=$(pwd)" >.env

echo "----- Generate lib -----"
npm add -D @nx/node@$version
npx nx generate @nx/node:lib --name nx-lib --publishable --importPath nx-lib

echo "----- Link ngx-deploy-npm -----"
npx --yes yalc add ngx-deploy-npm
npm i

echo "----- Add ngx-deploy-npm to the workspace -----"
npx nx generate ngx-deploy-npm:install

echo "----- Test the build -----"
npx nx deploy nx-lib --dry-run
