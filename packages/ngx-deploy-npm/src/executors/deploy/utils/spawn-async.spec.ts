import { logger } from '@nrwl/devkit';

import { spawnAsync } from './spawn-async';
import * as child_process from 'child_process';
import type { SpawnMock } from '../../../__mocks__/child_process';
jest.mock('child_process');
const mockedChildProcess: SpawnMock = child_process as unknown as SpawnMock;

describe('spawnAsync', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should complete the promise when the command finish', async () => {
    const command = 'ls';

    const promise = spawnAsync(command);
    mockedChildProcess.listOfChildProcess[command].emit('close', 0);
    const returnedValue = await promise;

    expect(returnedValue).toBeUndefined();
  });

  it('should reject the promise when the command finish with error code', async () => {
    const command = 'ls';
    const errorCode = 1;

    await expect(() => {
      const promise = spawnAsync(command);
      mockedChildProcess.listOfChildProcess[command].emit('close', errorCode);

      return promise;
    }).rejects.toEqual(errorCode);
  });

  it('should reject the promise when the command emits on the error event', async () => {
    const command = 'ls';
    const errorData = 'error-data';

    await expect(() => {
      const promise = spawnAsync(command);
      mockedChildProcess.listOfChildProcess[command].emit('error', errorData);

      return promise;
    }).rejects.toEqual(errorData);
  });

  it("should log the data of the command's standard output (stdout)", async () => {
    const command = 'ls';
    const buffer = Buffer.from('buffer with data');

    const promise = spawnAsync(command);
    mockedChildProcess.listOfChildProcess[command].stdout.emit('data', buffer);
    mockedChildProcess.listOfChildProcess[command].emit('close', 0);
    await promise;

    expect(logger.info).toHaveBeenCalledWith(buffer.toString());
  });

  it("should log the data of the command's standard error (stderr)", async () => {
    const command = 'ls';
    const buffer = Buffer.from('buffer with data');

    const promise = spawnAsync(command);
    mockedChildProcess.listOfChildProcess[command].stderr.emit('data', buffer);
    mockedChildProcess.listOfChildProcess[command].emit('close', 0);
    await promise;

    expect(logger.info).toHaveBeenCalledWith(buffer.toString());
  });
});
