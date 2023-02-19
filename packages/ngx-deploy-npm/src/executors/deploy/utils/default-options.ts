import { npmAccess } from '../../../core';
import { NpmPublishOptions } from './interfaces';

export const defaults: NpmPublishOptions = {
  access: npmAccess.public,
};
