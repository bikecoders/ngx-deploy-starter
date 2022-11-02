import * as strategies from './strategies';
import {
  getLibOutPutPath,
  NotAbleToDetermineDistPathError,
} from './strategy-selector';

describe('strategy selector', () => {
  let projectRoot: string;
  const pathFoundForStrategy = (strategy: keyof typeof strategies) =>
    `${projectRoot}/path/to/${strategy}/dist`;

  const setIsStrategyApplicable = (
    isStrategyApplicable: (strategy: keyof typeof strategies) => boolean
  ) =>
    Object.keys(strategies).forEach(async strategy => {
      const currentStrategyKey = strategy as keyof typeof strategies;
      jest
        .spyOn(strategies[currentStrategyKey], 'isStrategyApplicable')
        .mockImplementation(() => isStrategyApplicable(currentStrategyKey));
    });

  beforeEach(() => {
    projectRoot = '/mock/absolute/path';
  });

  beforeEach(() => {
    // Set all executors to return a path
    Object.keys(strategies).forEach(async strategy => {
      const currentStrategyKey = strategy as keyof typeof strategies;

      jest
        .spyOn(strategies[currentStrategyKey], 'executor')
        .mockImplementation(() => pathFoundForStrategy(currentStrategyKey));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should launch an error if no strategy is applicable', async () => {
    // Make return false all the isStrategyApplicable strategies methods
    setIsStrategyApplicable(() => false);

    await expect(() =>
      getLibOutPutPath(projectRoot, {}, {})
    ).rejects.toThrowError(NotAbleToDetermineDistPathError);
  });

  it('should the strategy custom dist path have maximum priority', async () => {
    setIsStrategyApplicable(() => true);

    const path = await getLibOutPutPath(projectRoot, {}, {});

    expect(path).toEqual(pathFoundForStrategy('customDistPathStrategy'));
  });

  it('should the strategy outputPath have priority over ngPackage strategy', async () => {
    setIsStrategyApplicable(
      strategy =>
        strategy === 'outputPathOptionStrategy' ||
        strategy === 'ngPackageStrategy'
    );

    const path = await getLibOutPutPath(projectRoot, {}, {});

    expect(path).toEqual(pathFoundForStrategy('outputPathOptionStrategy'));
  });

  it('should the strategy ngPackage have the least of the priorities', async () => {
    setIsStrategyApplicable(strategy => strategy === 'ngPackageStrategy');

    const path = await getLibOutPutPath(projectRoot, {}, {});

    expect(path).toEqual(pathFoundForStrategy('ngPackageStrategy'));
  });

  const testStrategy = (strategy: keyof typeof strategies) => {
    it(`should execute ${strategy} strategy`, async () => {
      setIsStrategyApplicable(str => str === strategy);

      const path = await getLibOutPutPath(projectRoot, {}, {});

      expect(path).toEqual(pathFoundForStrategy(strategy));
    });
  };

  testStrategy('customDistPathStrategy');
  testStrategy('outputPathOptionStrategy');
  testStrategy('ngPackageStrategy');
});
