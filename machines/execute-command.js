module.exports = {


  friendlyName: 'Execute command',


  description: 'Execute a command like you would on the terminal.',


  extendedDescription:
  'This uses the `child_process.exec()` method from Node.js core to run the specified command. '+
  'The success exit from this machine will not be called until the command has finished running (i.e. the resulting child process exits).',


  moreInfoUrl: 'https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback',


  inputs: {

    command: {
      friendlyName: 'Command',
      description: 'The command to run.',
      example: 'ls -la',
      required: true
    },

    dir: {
      friendlyName: 'Run from...',
      description: 'The path to the directory where this command will be run.',
      extendedDescription: 'If not set, this defaults to the present working directory.  If a relative path is provided, it will be resolved relative to the present working directory.',
      example: '/Users/mikermcneil/foo'
    },

    timeout: {
      friendlyName: 'Timeout',
      description: 'The maximum number of miliseconds to wait for this command to finish.',
      extendedDescription: 'If not set, no time limit will be enforced.',
      example: 60000
    }

  },


  exits: {

    notADir: {
      friendlyName: 'not a directory',
      description: 'The specified path points to a something which is not a directory (e.g. a file or shortcut).'
    },

    forbidden: {
      friendlyName: 'forbidden',
      description: 'Insufficient permissions to spawn process from the specified path (i.e. you might need to use `chown`/`chmod`)'
    },

    noSuchDir: {
      friendlyName: 'no such directory',
      description: 'Cannot run process from the specified path because no such directory exists.'
    },

    // TODO: `timeout` exit (need to experiment here-- it is not explicitly covered in Node core docs)

    success: {
      variableName: 'bufferedOutput',
      description: 'Done.',
      example: {
        stdout: '...',
        stderr: '...'
      },
    },

  },


  fn: function (inputs,exits) {

    var path = require('path');
    var util = require('util');
    var executeCmdInChildProc = require('child_process').exec;

    // First, build up the options to pass in to `child_process.exec()`.
    var childProcOpts = {};

    // Determine the appropriate `cwd` for `child_process.exec()`.
    if (util.isUndefined(inputs.dir)) {
      // Default directory to current working directory
      childProcOpts.cwd = process.cwd();
    }
    else {
      // (or if a `dir` was specified, resolve it to make sure
      //  it's an absolute path.)
      childProcOpts.cwd = path.resolve(inputs.dir);
    }

    // If `timeout` was provided, pass it in to `child_process.exec()`.
    if (util.isUndefined(inputs.timeout)) {
      childProcOpts.timeout = inputs.timeout;
    }

    // Now spawn the child process.
    var liveChildProc = executeCmdInChildProc(inputs.command, childProcOpts, function onClose(err, bufferedStdout, bufferedStderr) {
      if (err) {
        if (!util.isObject(err)) {
          return exits.error(err);
        }
        // console.log('err=>',err);
        // console.log('keys=>',Object.keys(err));
        // console.log('err.code=>',err.code);
        // console.log('err.killed=>',err.killed);
        // console.log('err.syscall=>',err.syscall);
        // console.log('err.errno=>',err.errno); // e.g. 127 || 'ENOENT'
        // console.log('err.signal=>',err.signal); // e.g. 'SIGTERM'

        // `err.syscall.match(/spawn/i)` should be true as well, but not testing since
        // Node v0.12 changed this a bit and we want to future-proof ourselves if possible.
        if (err.code==='ENOTDIR') {
          return exits.notADir();
        }
        if (err.code==='ENOENT') {
          return exits.noSuchDir();
        }
        if (err.code==='EACCES') {
          return exits.forbidden();
        }
        return exits.error(err);
      }

      // console.log('Child process exited with exit code ' + code);
      return exits.success({
        stdout: bufferedStdout,
        stderr: bufferedStderr
      });
    });
  },



};
