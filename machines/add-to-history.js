module.exports = {


  friendlyName: 'Add to history',


  description: 'Append a command to the end of the shell history.',


  extendedDescription: 'Upon success, the command-line user will be able to press <UP_ARROW> to get this command instead of whatever they typed most recently.',


  moreInfoUrl: 'http://superuser.com/a/135654',


  inputs: {

    command: {
      friendlyName: 'Command',
      description: 'The command to append.',
      example: 'echo \'hi there!\'',
      required: true
    }

  },


  exits: {

  },


  fn: function (inputs,exits) {
    var thisPack = require('../');
    thisPack.spawn({
      command: 'history -s ' + '\''+thisPack.escape({value:inputs.command}).execSync()+'\''
    }).exec({
      error: exits.error,
      success: function (){
        return exits.success();
      }
    });
  },



};
