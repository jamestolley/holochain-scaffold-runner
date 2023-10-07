const { readFileSync } = require('fs');
const yargs = require('yargs');
const { exec } = require('node:child_process');

// gather config options

const args = yargs.argv;

if (typeof args.configfile == 'undefined' || typeof args.windowtitle == 'undefined') {
  console.log("USAGE: node src/index.js --configfile [config filename] --windowtitle [window title]");
  process.exit();
}

// setup

/*

TODO:
  log actions, if the --log flag is set
  different config files for each type of hc scaffold action
    dna
    zome
    entry
    etc

*/

const data = readFileSync(`./${args.configfile}`);
const config = JSON.parse(data);

// done with setup

// run the config

// pass in the config, for the other options
run_commands(config.commands, { ...config, ...args });

// process.exit();

// for outputting the command to the console, for debugging
function escape_command(cmd) {
  return '"' + cmd.replace(/(["'$`\\])/g,'\\$1') + '"';
};

function run_commands(commands, config) {

  if (commands.length) {

    // shift the first command and use it
    let this_command = commands.shift();
    let this_command_command = this_command.command;

    // replace variables in the commands
    var placeholders = this_command_command.match(/\{([^}]*)\}/g); // "this is a {placeholder}..."
    if (placeholders) {
      placeholders.forEach((placeholder) => {
        var this_key = placeholder.substring(1,placeholder.length - 1);
        if(typeof config[this_key] != 'undefined'){
          this_command_command = this_command_command.replace(placeholder, config[this_key]);
        }
      })
    }

    // print the command to console
    let escaped_command = escape_command(this_command_command);
    console.log(`this command: ${escaped_command}`);
    if (typeof this_command.comment != 'undefined' && typeof config.comments != 'undefined') {
      console.log(`\t // ${this_command.comment}`);
    }

    // run the command, unless this is just a "dry run",
    //  that is, if it's just listing the commands and not running them.
    if (typeof args.dryrun == 'undefined') {
      exec(this_command_command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
      });
    }

    // reexecute using the rest of the commands
    if (commands.length) {
      setTimeout(() => {
        run_commands(commands, config)
      }, typeof args.dryrun == 'undefined' ? this_command.timeout : 1);
    }
  }
}