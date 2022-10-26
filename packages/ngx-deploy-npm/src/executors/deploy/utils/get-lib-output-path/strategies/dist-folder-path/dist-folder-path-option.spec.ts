import { UnapplicableStrategyError } from '../shared';
import { customDistPathStrategy } from './dist-folder-path-option';

describe('distFolderPathStrategy', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = 'some/fake/root/folder';
  });

  it('should return the right dist path', () => {
    const distFolderPath = 'my/custom-folder';
    const expectedPath = `${projectRoot}/${distFolderPath}`;

    const path = customDistPathStrategy.executor(
      projectRoot,
      {
        outputPath: 'some/path',
      },
      {
        distFolderPath,
      }
    );

    expect(path).toBe(expectedPath);
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
      const distFolderPath = 'my/custom-folder';

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
