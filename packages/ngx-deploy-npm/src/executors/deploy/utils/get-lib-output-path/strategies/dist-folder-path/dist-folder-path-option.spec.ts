import * as path from 'path';

import { UnapplicableStrategyError } from '../shared';
import { customDistPathStrategy } from './dist-folder-path-option';
import { mockProjectRoot } from '../../../../../../__mocks__/generators';

describe('distFolderPathStrategy', () => {
  const projectRoot = mockProjectRoot;
  const distFolderPath = path.join('my', 'custom-folder');

  it('should return the right dist path', () => {
    const expectedPath = path.join(projectRoot, distFolderPath);

    const customPath = customDistPathStrategy.executor(
      projectRoot,
      {
        outputPath: 'some/path',
      },
      {
        distFolderPath,
      }
    );

    expect(customPath).toBe(expectedPath);
  });

  it('should throw an error if trying the execute the strategy when it is not applicable', () => {
    expect(() =>
      customDistPathStrategy.executor(
        projectRoot,
        {
          outputPath: 'some/path',
        },
        {}
      )
    ).toThrowError(UnapplicableStrategyError);
  });

  describe('isStrategyApplicable', () => {
    it('should indicate positively if the strategy is applicable', () => {
      const isApplicable = customDistPathStrategy.isStrategyApplicable(
        {
          outputPath: 'some/path',
        },
        {
          distFolderPath,
        }
      );

      expect(isApplicable).toBe(true);
    });

    it('should indicate negatively if the strategy is not applicable', () => {
      const isApplicable = customDistPathStrategy.isStrategyApplicable(
        {
          outputPath: 'some/path',
        },
        {}
      );

      expect(isApplicable).toBe(false);
    });
  });
});
