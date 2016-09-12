module.exports = {


  friendlyName: 'Escape as command-line option',


  description: 'Escape a value for use as a command-line option (e.g. the "XXXXX" in `--foobar=\'XXXXX\'`).',


  extendedDescription:
  'When using the escaped result string from this method as a command-line option, make sure to wrap it in a pair of single quotes.  '+
  'For instance `--foo=\'RESULT_FROM_THIS_MACHINE_HERE\'`  or `-f \'RESULT_FROM_THIS_MACHINE_HERE\'.',


  sideEffects: 'cacheable',


  sync: true,


  inputs: {

    value: {
      description: 'The value to escape as a command-line option.',
      extendedDescription:
      'If the provided value is a string, it will be left as-is in the escaped result.\n'+
      'But otherwise, if the provided value is anything else (like a number, boolean, dictionary or array), '+
      'then this machine will attempt to serialize it into a JSON string before escaping.\n'+
      'In other words, whether you provide the number `4` or the string `4`, the escaped result will be '+
      'the same: the string `4`.  That\'s because the string `4` was left as-is, and because stringifying '+
      'the number `4` happens to result in the same value: the string `4`.\n'+
      '\n'+
      'Note that this exception for strings only applies at the top level.  _Nested strings_ inside of dictionaries '+
      'or arrays are swept up in the JSON encoding of their ancestors and are therefore serialzed normally (i.e. wrapped in '+
      'double quotes).   For example, if you provide the dictionary: `{a: \'4\', b: 4}` (where `a` is a nested string '+
      'and `b` is a nested number), then the escaped result will be the JSON string: `{"a":"4", "b": 4}`.',
      example: '===',
      required: true
    },

  },


  exits: {

    success: {
      outputFriendlyName: 'Escaped value',
      outputDescription: 'The escaped value ready for use as a command-line option.',
      outputExample: 'it\'\\\'\'s my birthday!'
    },

    couldNotSerialize: {
      description: 'The provided value was not a string, and it could not be serialized into a JSON string.'
    }

  },


  fn: function (inputs,exits) {

    // Import `util`.
    var util = require('util');

    // Import `lodash`.
    var _ = require('lodash');

    // Import `machinepack-json`.
    var MPJSON = require('machinepack-json');


    // First, determine the string to escape.
    var stringToEscape;
    // If this is a string, we'll use it verbatim.
    if (_.isString(inputs.value)) {
      stringToEscape = inputs.value;
    }
    // But otherwise, attempt to JSON stringify it before escaping.
    else {
      // Attempt to stringify the value.
      try {
        stringToEscape = MPJSON.stringifySafe({value:inputs.value}).execSync();
      } catch (e) {
        // If we couldn't stringify the value, exit through the `couldNotSerialize` exit.
        if (e.code === 'E_MACHINE_RUNTIME_VALIDATION') {
          return exits.couldNotSerialize();
        }
        // If some other error occurred while trying to stringify, forward it
        // through our `error` exit.
        return exits.error(e);
      }
    }// >-


    // Now escape our potentially pre-processed string for use as a command-line option:
    //
    // • Replace every occurrence of a single quote (') with an escaped
    //   single quote wrapped in a pair of additional single quotes (e.g. '\'')
    var escapedVal = stringToEscape.replace(/'/g,'\'\\\'\'');


    // Return the result through the `success` exit.
    return exits.success(escapedVal);

  }


};
