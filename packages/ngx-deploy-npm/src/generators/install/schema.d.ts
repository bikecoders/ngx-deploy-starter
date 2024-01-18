export interface InstallGeneratorOptions {
  /**
   * The dist folder path. The path should be relative to the project's root
   */
  distFolderPath: string;
  /**
   * Which library should configure
   */
  project: string;
  /**
   * Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.
   */
  access: 'public' | 'restricted';
}
