var EXPECTED_TMM_SEMVER_RANGE = require('../package.json').devDependencies['test-machinepack-mocha'];
console.log('hey. travis ci.  what is going on?', 'package.json says to use TMM@'+EXPECTED_TMM_SEMVER_RANGE+'.');


console.log('What version of TMM are you ACTUALLY using?',require('test-machinepack-mocha/package.json').version);


console.log('What version of test-mp is THAT one ACTUALLY using?',require('test-machinepack-mocha/node_modules/test-machinepack/package.json').version);
