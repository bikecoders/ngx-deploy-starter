import * as fs from 'fs';
import * as path from 'path';
import { fileExists } from './file-utils';

describe('File Utils', () => {
  describe('FileExists', () => {
    let fakeFilePath: string;

    const setUp = ({ fileShouldExists }: { fileShouldExists: boolean }) => {
      const accessSpy = jest
        .spyOn(fs, 'access')
        .mockImplementation((_: fs.PathLike, callback: fs.NoParamCallback) => {
          if (fileShouldExists) {
            callback(null);
          } else {
            callback(new Error('File not found'));
          }
        });

      return {
        accessSpy,
      };
    };

    beforeEach(() => {
      fakeFilePath = path.join('random', 'path', 'file', 'package.json');
    });

    it('should indicate that the file exists', async () => {
      setUp({ fileShouldExists: true });

      const response = await fileExists(fakeFilePath);

      expect(response).toBe(true);
    });

    it('should indicate that the file exists', async () => {
      setUp({ fileShouldExists: false });

      const response = await fileExists(fakeFilePath);

      expect(response).toBe(false);
    });
  });
});
