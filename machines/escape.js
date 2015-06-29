module.exports = {


  friendlyName: 'Escape CLI opt',


  description: 'Escape a value for use as a command-line option (e.g. the "XXXXX" in `--foobar=\'XXXXX\'`).',


  extendedDescription: 'The result should be wrapped in single quotes when building up the final CLI options string.  For instance `--foo=\'RESULT_FROM_THIS_MACHINE_HERE\'`  or `-f \'RESULT_FROM_THIS_MACHINE_HERE\'',


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

    var _ = require('lodash');
    var MPJSON = require('machinepack-json');

    // Stringify if necessary
    var val = inputs.value;
    if (_.isObject(val)) {
      val = MPJSON.stringifySafe({value:val}).execSync();
    }
    else {
      val = val+'';
    }
    if (!_.isString(val)) {
      return exits.couldNotSerialize();
    }

    // Now escape the resulting string
    val = val.replace(/'/g,'\'\\\'\'');

    return exits.success(val);
  },



};
