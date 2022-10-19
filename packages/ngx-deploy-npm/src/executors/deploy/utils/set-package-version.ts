import * as fs from './file-utils';
import * as path from 'path';

export async function setPackageVersion(dir: string, packageVersion: string) {
  const packageContent: string = await fs.readFileAsync(
    path.join(dir, 'package.json'),
    { encoding: 'utf8' }
  );

  const packageObj = JSON.parse(packageContent);

  packageObj.version = packageVersion;

  await fs.writeFileAsync(
    path.join(dir, 'package.json'),
    JSON.stringify(packageObj, null, 4),
    { encoding: 'utf8' }
  );
}
