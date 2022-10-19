export interface InstallGeneratorOptions {
  /**
   * Which library should configure
   */
  projects?: string[];
  /**
   * Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.
   */
  access?: 'public' | 'restricted';
}
