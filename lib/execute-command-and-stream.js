module.exports = {


  friendlyName: 'Execute command and stream',


  description: 'Execute a command like you would on the terminal, but instead of waiting for it to finish, immediately return its stdout stream.',


  extendedDescription:
  'The responsibility for any other validations/error handling falls on the consumer of the stream. However, this method '+
  '_DOES_ bind an `error` event handler on the stream to prevent emitted error events from crashing the process; ensuring that this '+
  'method is agnostic of its userland environment. If you plan to write code which uses the readable stream returned by this method '+
  'but you have never worked with Readable streams in Node.js, [check this out](https://docs.nodejitsu.com/articles/advanced/streams/how-to-use-fs-create-read-stream) '+
  'for tips. For more conceptual information about readable streams in Node.js in general, check out the section on '+
  '[`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable) in the Node.js docs.',


  inputs: {

    command: {
      description: 'The command to run in the child process, without any CLI arguments or options.',
      extendedDescription: 'Node core is tolerant of CLI args mixed in with the main "command" in `child_process.exec()`, but it is not so forgiving when using `child_process.spawn()`.  That means you cannot provide a command like "git commit" this way.  Instead, provide "git" as the command and `["commit"]` as the CLI args.',
      example: 'ls',
      required: true
    },

    cliArgs: {
      friendlyName: 'CLI args/opts',
      description: 'An array of serial command-line arguments (e.g. `commit` or `install`) and/or options (e.g. `-al` or `-f 7` or `--foo=\'bar\'`) to pass in.',
      example: ['-la'],
      defaultsTo: []
    },

    dir: {
      friendlyName: 'Run from...',
      description: 'The path to the directory where this command will be run.',
      extendedDescription: 'If not set, this defaults to the present working directory.  If a relative path is provided, it will be resolved relative to the present working directory.',
      example: '/Users/mikermcneil/foo'
    },

    environmentVars: {
      friendlyName: 'Environment variables',
      description: 'A dictionary of environment variables to provide to the child process.',
      extendedDescription: 'By default, the same environment variables as in the current process will be used.  If specified, the dictionary should consist of the name of each environment variable as a key, and the value of the variable on the right-hand side.  The value of any environment variable is always a string.',
      example: {}
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Readable stream (bytes)',
      outputDescription: 'The main output stream (stdout) from a Node child process.',
      moreInfoUrl: 'https://nodejs.org/api/child_process.html#child_process_subprocess_stdout',
      extendedDescription: 'By the time it is returned, a no-op `error` listener has already been bound to prevent accidental crashing in the event of an unexpected error.',
      outputExample: '===',
    },

  },


  fn: function (inputs, exits) {

    // Import Lodash.
    var _ = require('@sailshq/lodash');

    // Import this pack.
    var Pack = require('../');

    // First, spawn the child process.
    // (based on https://github.com/sailshq/machinepack-process/blob/99c87eb6cc284d965ed2c173c58dff86f711ab15/lib/spawn-child-process.js)
    var liveChildProc = Pack.spawnChildProcess({
      command: inputs.command,
      cliArgs: inputs.cliArgs,
      dir: inputs.dir,
      environmentVars: inputs.environmentVars,
    }).now();

    // Write stderr stream from child process to our own stderr stream
    liveChildProc.stderr.pipe(process.stderr);
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // ^^FUTURE: Improve the logging here.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Listen for when the child process closes successfully, or errors:
    // If the source (child process) encounters an error, or any kind of
    // non-zero process exit code, then we'll fail with an error.
    liveChildProc.once('error', (err)=>{
      reject(err);
    });//œ

    liveChildProc.once('close', (processExitCode)=>{
      if (processExitCode !== 0) {
        reject(new Error('PDF compilation failed because child process terminated unsuccessfully (process exit code: '+processExitCode+').'));
      } else {
        resolve();
      }
    });//œ

    // Ensure child process is dead, killing it if necessary before proceeding.
    // TODO

    // All done.
    return exits.success(liveChildProc.stdout);

  }


};

// module.exports = {


//   friendlyName: 'Compile and transload PDF',


//   description: 'Call out to compiler to obtain a PDF using the provided settings, then stream it up to S3.',


//   timeout: 30000,


//   inputs: {

//     pdfTemplate: {
//       description: 'The PDF template to use.',
//       extendedDescription:
//       `This is more than just a template name-- it corresponds with all the various
//       customizations, overflow management, layout rules, and so forth that Jake
//       and his team have built.`,
//       type: 'string',
//       isIn: [
//         'tx-tar',
//         'tx-trec',
//         'tx-lead-paint-addendum',
//         'tx-flood-plain-addendum',
//       ],
//       required: true
//     },

//     templateData: {
//       description: 'The structured data to pass in to the PDF compiler for a big madlib party.',
//       type: {},
//       defaultsTo: {}
//     },

//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//     // FUTURE: Any other miscellaneous options or metadata to vary the behavior
//     // of g PDF's compiler
//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//   },


//   exits: {

//     // TODO: declare what data we'll need about the final transloaded PDF

//   },


//   fn: async function ({pdfTemplate, templateData}, exits) {

//     // Import Node's native `path` library and `child_process.spawn` method.
//     var path = require('path');
//     var spawn = require('child_process').spawn;

//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//     // ```
//     // // If this is not staging or production, skip PDF compilation.
//     // if (sails.config.environment !== 'staging' && sails.config.environment !== 'production') {
//     //   sails.log('Skipped compiling PDF since this is not staging or production...');
//     //   sails.log.info('Would have compiled PDF using the "'+pdfTemplate+'" template and the following template data:\n', templateData);
//     //   // TODO: Send back proper data
//     //   return exits.success();
//     // }//•
//     // ```
//     // ^^TODO bring that back, when ready
//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


//     // Otherwise, keep going.
//     sails.log.info('Compiling PDF using the "'+pdfTemplate+'" template, as well as the following data:\n', templateData);


//     // Kick off PDF compilation as child process and transload its bytes to S3
//     // as they become available:

//     // First, spawn the child process.
//     // (based on https://github.com/sailshq/machinepack-process/blob/99c87eb6cc284d965ed2c173c58dff86f711ab15/lib/spawn-child-process.js)
//     var liveChildProc = spawn(
//     // var liveChildProc = spawn('echo', ['hello world'], {
//       'php',
//       [
//         'workers/g-pdf/run.php',
//         pdfTemplate,
//         '--templateData', JSON.stringify(templateData)
//       ],
//       {
//         cwd: path.resolve(sails.config.appPath)
//       }
//     );

//     // Write stderr stream from child process to our own stderr stream
//     liveChildProc.stderr.pipe(process.stderr);
//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//     // ^^FUTURE: Improve the logging here.
//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//     var unexpectedError;
//     await sails.helpers.flow.simultaneously([

//       // Listen for when the child process closes successfully, or errors.
//       async()=>{
//         // If the source (child process) encounters an error, or any kind of
//         // non-zero process exit code, then we'll fail with an error.
//         // > Note that we use `.on()` instead of `.once()` here-- that's just
//         // > to make sure that we're handling any unexpected error emissions
//         // > that might pop up down the road.  (Should never happen, but if it
//         // > does, it would crash the process, which would be unpleasant.)
//         // > Also note that we build a Promise & send it back as our "thenable"
//         // > (AsyncFunction's return value).  This is necessary b/c we're wrapping
//         // > an api that isn't `await`-compatible.
//         return new Promise((resolve, reject)=>{
//           try {
//             liveChildProc.on('error', (err)=>{
//               reject(err);
//             });//œ
//             liveChildProc.once('close', (processExitCode)=>{
//               if (processExitCode !== 0) {
//                 reject(new Error('PDF compilation failed because child process terminated unsuccessfully (process exit code: '+processExitCode+').'));
//               } else {
//                 resolve();
//               }
//             });//œ
//           } catch (err) {
//             reject(err);
//           }
//         });
//       },

//       // Transload bytes to S3 as a PDF file.
//       async()=>{
//         await sails.helpers.fs.writeStream('./.tmp/example.pdf', liveChildProc.stdout, true);
//         // ^^TODO: actually do the S3 stuff
//       }

//     ])
//     .tolerate((err)=>{
//       unexpectedError = err;
//     });

//     // Ensure child process is dead, killing it if necessary before proceeding.
//     // TODO

//     // Now, throw the error, if there was one.
//     if (unexpectedError) {
//       throw unexpectedError;
//     }

//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//     // FUTURE: potentially run this on a queue if we need to ensure durability.
//     // For now, we'll just do it this way for simplicity's sake.  (Either way,
//     // the interface to g PDF shouldn't need to change.)
//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


//     // All done.
//     return exits.success();

//   }


// };

