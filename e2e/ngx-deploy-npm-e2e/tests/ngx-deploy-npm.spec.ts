import { installTest } from './install.test-factory';
import { deployTest } from './deploy';

describe('ngx-deploy-npm e2e', () => {
  describe('install/ng-add e2e', installTest);
  describe('deploy e2e', deployTest);
});
