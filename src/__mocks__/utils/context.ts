import { BuilderContext } from "@angular-devkit/architect";

export function createFakeContext({
  project,
  projectRoot,
  workspaceRoot
}: {
  project: string;
  projectRoot: string;
  workspaceRoot: string;
}): BuilderContext {
  return {
    scheduleTarget: jest.fn(),
    getTargetOptions: jest.fn(),
    getProjectMetadata: jest.fn().mockReturnValue({ root: projectRoot }),
    logger: { error: jest.fn(), info: jest.fn() },
    reportStatus: jest.fn(),
    target: {
      project
    },
    workspaceRoot
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } as any;
}
