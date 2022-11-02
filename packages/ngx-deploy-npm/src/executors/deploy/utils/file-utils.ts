import { promisify } from 'util';
import { readFile, writeFile } from 'fs';

export const readFileAsync = promisify(readFile);

export const writeFileAsync = promisify(writeFile);
