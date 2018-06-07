module.exports = {


  friendlyName: 'Open browser',


  description: 'Open the user\'s browser and navigate to the given URL.',


  sync: true,


  inputs: {

    url: {
      example: 'http://google.com',
      required: true
    }

  },


  fn: function (inputs, exits){

    // Import `open` and `openBrowserAndNavigateToUrl`.
    var openBrowserAndNavigateToUrl = require('opn');

    // Attempt to open the given URL in a browser window.
    openBrowserAndNavigateToUrl(inputs.url);

    // Return through the `success` exit.
    return exits.success();
  }


};
