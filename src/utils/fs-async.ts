import { readFile, writeFile } from 'fs';
import util from 'util';

export const readFileAsync = util.promisify(readFile);

export const writeFileAsync = util.promisify(writeFile);
