#!/bin/bash

set -e

export NG_CLI_ANALYTICS="false"

mkdir -p tmp
cd tmp

# Delete the previous workspace
rm -Rif angular-workspace

npx ng version

echo "Create Angular Workspace"
npx ng new --name angular-workspace --interactive false
cd angular-workspace

# Set the workspace on the right path
export NX_WORKSPACE_ROOT_PATH=`pwd`

echo "Generate lib"
npx ng generate library angular-lib

# Save changes to easily differ the changes made on the angular.json
git add . && git commit -m "chore: create boiler plate"

echo "Link ngx-deploy-npm"
yarn link ngx-deploy-npm

echo "Add ngx-deploy-npm to the workspace"
npx ng add ngx-deploy-npm

echo "Test the build"
npx ng deploy angular-lib --dry-run