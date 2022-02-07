const path = require('path');

module.exports = function (results, context) {
  const issues = results.filter(
    ({ errorCount, fatalErrorCount, warningCount }) =>
      errorCount + fatalErrorCount + warningCount > 0
  );

  issues.forEach(
    result =>
      (result.filePath = result.filePath.replace(
        /**
         * If a new package comes in, this needs to be rethinked.
         *
         * Probably we would need a custom formater for each package
         * or findind a regular expresion that will cover all the possible packages' path,
         */
        path.join(context.cwd, '/', 'packages', 'ngx-deploy-npm', '/'),
        './'
      ))
  );

  return JSON.stringify(issues, null, 2);
};
