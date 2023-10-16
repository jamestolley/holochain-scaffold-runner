const yargs = require('yargs');
const { HCScaffold } = require('./HCScaffold');

try {
  new HCScaffold(yargs.argv).run();
} catch (e) {
  console.error(`HCScaffold failed with error: ${e}`);
}
