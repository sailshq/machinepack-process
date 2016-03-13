module.exports = {


  friendlyName: 'Kill child process',


  description: 'Gracefully kill a child process.',


  extendedDescription: 'This uses the `.kill()` instance method from Node.js core.  By default, SIGTERM is used.',


  moreInfoUrl: 'https://nodejs.org/api/child_process.html#child_process_child_kill_signal',


  inputs: {

    childProcess: {
      friendlyName: 'Child process',
      description: 'The child process to kill.',
      example: '===',
      required: true
    },

    force: {
      friendlyName: 'Force?',
      description: 'If set, then force the child process to exit if it cannot be killed gracefully.',
      extendedDescription: 'If set, this method will first attempt to shut down the child process gracefully (SIGTERM); but if that doesn\'t work after a few miliseconds (`maxMsToWait`), it will use the nuclear option (SIGKILL) to kill the child process with no exceptions.',
      example: false,
      defaultsTo: false
    },

    maxMsToWait: {
      description: 'The maximum number of miliseconds to wait for the child process to shut down gracefully.',
      example: 500,
      defaultsTo: 500
    }

  },


  exits: {

    invalidChildProcess: {
      friendlyName: 'Invalid child process',
      description: 'The specified value is not a valid child process instance.',
      extendedDescription: 'You can obtain a child process instance by calling `spawnChildProcess()`.'
    },

    couldNotKill: {
      description: 'The child process could not be killed gracefully.',
      extendedDescription: 'The process can be killed by running this machine again with `force` enabled.',
    },

    success: {
      description: 'The child process has been killed.'
    }

  },


  fn: function (inputs,exits) {
    var util = require('util');

    // Validate that the provided child process instance is at least close to the real deal.
    if (!util.isObject(inputs.childProcess) || !util.isFunction(inputs.childProcess.kill) || !util.isFunction(inputs.childProcess.on) || !util.isFunction(inputs.childProcess.removeListener)) {
      return exits.invalidChildProcess();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // For posterity: The difference between SIGKILL, SIGTERM, and SIGINT:
    //
    // • SIGKILL
    //   ° Like running `kill -9`.
    //   ° Can't listen for this, because it kills the process before you have a chance to do anything.
    //
    // • SIGTERM   (recommended)
    //   ° Like running `kill`.
    //   ° Allows graceful shutdown.
    //
    // • SIGINT
    //   ° Like hitting CTRL+C.
    //   ° Allows graceful shutdown.
    //
    // > The above was based on the great explanation at https://www.exratione.com/2013/05/die-child-process-die/#considering-unix-signals.
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    var timer;
    var handleClosingChildProc;

    // Listen for the child process being closed.
    inputs.childProcess.on('close', function handleClosingChildProc (code, signal) {
      try {
        if (signal === 'SIGKILL') {
          // Ignore SIGKILL
          // (if we're seeing it here, it came from somewhere else, and we don't want to get confused)
          return;
        }

        clearTimeout(timer);
      }
      catch (e) {
        return exits.error(e);
      }
    });

    // Set a timer.
    // (If the child process has not closed gracefully after `inputs.maxMsToWait`,
    //  then we need to either force kill it with SIGKILL, or fail via the
    //  `couldNotKill` exit.)
    timer = setTimeout(function (){
      try {
        if (inputs.force) {
          inputs.childProcess.removeListener('close', handleClosingChildProc);
          inputs.childProcess.kill('SIGKILL');
          return exits.success();
        }
        else {
          inputs.childProcess.removeListener('close', handleClosingChildProc);
          return exits.couldNotKill();
        }
      }
      catch (e) {
        return exits.error(e);
      }
    }, inputs.maxMsToWait);


    // Now attempt to kill the child process gracefully (send SIGTERM).
    inputs.childProcess.kill();

  },



};
