import { logger } from '@nrwl/devkit';
import { spawn } from 'child_process';

export function spawnAsync(command: string, args?: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);

    process.stdout.on('data', data => {
      logger.info(data.toString());
    });
    process.stderr.on('data', data => {
      logger.info(data.toString());
    });

    process.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
    process.on('error', reject);
  });
}
