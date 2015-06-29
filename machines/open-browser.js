module.exports = {


  friendlyName: 'Open browser',


  sync: true,


  description: 'Open the user\'s browser and navigate to the given URL.',


  inputs: {

    url: {
      example: 'http://google.com',
      required: true
    }

  },


  fn: function (inputs, exits){
    var openBrowserAndNavigateToUrl = require('open');
    openBrowserAndNavigateToUrl(inputs.url);
    return exits.success();
  }


};
