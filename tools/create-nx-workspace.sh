#!/bin/bash

set -e

npx nx run ngx-deploy-npm-e2e:e2e \
  --testNamePattern="ngx-deploy-npm e2e install/ng-add e2e" \
  --skip-nx-cache
