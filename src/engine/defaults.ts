import { Schema } from '../deploy/schema';

export type NpmPublishOptions = Pick<
  Schema,
  'access' | 'tag' | 'otp' | 'dryRun'
>;

export enum npmAccess {
  public = 'public',
  restricted = 'restricted'
}

export const defaults: NpmPublishOptions = {
  tag: undefined,
  access: npmAccess.public,
  otp: undefined,
  dryRun: false
};
