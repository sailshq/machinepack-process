module.exports = {


  friendlyName: 'Escape CLI option',


  description: 'Escape a value for use as a command-line option (e.g. the "XXXXX" in `--foobar=\'XXXXX\'`).',


  extendedDescription:
    'When using the escaped result returned from this method, make sure to wrap it in single quotes when building up the final CLI options string.  '+
    'For instance `--foo=\'RESULT_FROM_THIS_MACHINE_HERE\'`  or `-f \'RESULT_FROM_THIS_MACHINE_HERE\'',


  sideEffects: 'cacheable',


  sync: true,


  inputs: {

    value: {
      description: 'The value to escape as a CLI option.',
      example: '===',
      required: true
    },

  },


  exits: {

    success: {
      outputFriendlyName: 'Escaped CLI option',
      outputExample: '{"foo":"bar"}',
      outputDescription: 'The escaped value ready for use as a CLI option.',
    },

    couldNotSerialize: {
      description: 'The provided value could not be serialized into a JSON string.'
    },

  },


  fn: function (inputs,exits) {

    // Import `util`.
    var util = require('util');

    // Import `isObject` and `isString` Lodash functions.
    var isObject = require('lodash.isobject');
    var isString = require('lodash.isstring');

    // Import `machinepack-json`.
    var MPJSON = require('machinepack-json');

    // If this is a dictionary/array, then JSON stringify it.
    var val = inputs.value;
    if (isObject(val)) {
      // Attempt to stringify the value.
      try {
        val = MPJSON.stringifySafe({value:val}).execSync();
      }
      catch (e) {
        // If we couldn't stringify the value, exit through the `couldNotSerialize` exit.
        if (e.code === 'E_MACHINE_RUNTIME_VALIDATION') {
          return exits.couldNotSerialize();
        }
        // If some other error occurred while trying to stringify, forward it
        // through our `error` exit.
        return exits.error(e);
      }
    }
    // Otherwise, cast it to a string.
    else {
      val = val+'';
    }

    // Now escape the resulting string as a CLI option.
    val = val.replace(/'/g,'\'\\\'\'');

    // Return the result through the `success` exit.
    return exits.success(val);
  },



};
