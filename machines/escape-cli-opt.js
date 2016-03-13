module.exports = {


  friendlyName: 'Escape CLI opt',


  description: 'Escape a value for use as a command-line option (e.g. the "XXXXX" in `--foobar=\'XXXXX\'`).',


  extendedDescription: 'When using the escaped result returned from this method, make sure to wrap it in single quotes when building up the final CLI options string.  For instance `--foo=\'RESULT_FROM_THIS_MACHINE_HERE\'`  or `-f \'RESULT_FROM_THIS_MACHINE_HERE\'',


  cacheable: true,


  sync: true,


  inputs: {

    value: {
      friendlyName: 'Value',
      description: 'The value to escape as a CLI option.',
      example: '*',
      required: true
    },

  },


  exits: {

    couldNotSerialize: {
      description: 'The provided value could not be serialized into a JSON string.'
    },

    success: {
      variableName: 'escaped',
      example: '{"foo":"bar"}',
      description: 'Done.',
    },

  },


  fn: function (inputs,exits) {

    var util = require('util');
    var MPJSON = require('machinepack-json');

    // Stringify if necessary
    var val = inputs.value;
    if (util.isObject(val)) {
      val = MPJSON.stringifySafe({value:val}).execSync();
    }
    else {
      val = val+'';
    }

    if (!util.isString(val)) {
      return exits.couldNotSerialize();
    }

    // Now escape the resulting string as a CLI option.
    val = val.replace(/'/g,'\'\\\'\'');

    return exits.success(val);
  },



};
