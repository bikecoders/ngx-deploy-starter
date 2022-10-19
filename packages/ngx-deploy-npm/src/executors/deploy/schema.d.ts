export interface DeployExecutorOptions {
  /**
   * Indicate the dist folder path. This is useful when ngx-deploy-npm can not detect your library dist folder automatically. The path should be relative to the project's root
   */
  distFolderPath?: string;
  /**
   * A named build target, as specified in the `configurations` section of workspace/angular.json. Each named target is accompanied by a configuration of option defaults for that target. This is equivalent to calling the command `[nx|ng] build --configuration=XXX`.
   */
  buildTarget?: string;
  /**
   * Skip build process during deployment.
   */
  noBuild?: boolean;
  /**
   * The version that your package is going to be published. Ex: '1.3.5' '2.0.0-next.0'
   */
  packageVersion?: string;
  /**
   * Registers the published package with the given tag, such that `npm install @` will install this version. By default, `npm publish` updates and `npm install` installs the `latest` tag. See `npm-dist-tag` for details about tags.
   */
  tag?: string;
  /**
   * Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.
   */
  access?: 'public' | 'restricted';
  /**
   * If you have two-factor authentication enabled in auth-and-writes mode then you can provide a code from your authenticator with this. If you don’t include this and you’re running from a TTY then you’ll be prompted.
   */
  otp?: string | number;
  /**
   * For testing: Run through without making any changes. Execute with --dry-run and nothing will happen.
   */
  dryRun?: boolean;
}
