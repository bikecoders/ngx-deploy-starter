export class UnapplicableStrategyError extends Error {
  constructor(strategyName: string) {
    const errorMsg = `Trying to apply the strategy '${strategyName}' when it's not possible`;
    super(errorMsg);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // It does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}
