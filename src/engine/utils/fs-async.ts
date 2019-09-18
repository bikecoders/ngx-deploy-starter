import util from 'util';
import { readFile, writeFile } from 'fs';

export const readFileAsync = util.promisify(readFile);

export const writeFileAsync = util.promisify(writeFile);
