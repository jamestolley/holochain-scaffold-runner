# Holochain scaffold runner

Holochain scaffold runner is used to automate the Holochain scaffolding process.

## Installation

```bash
> npm install holochain-scaffold-runner
```

## Usage

After installation, edit the configuration files as needed and then run

```bash
> node src/index.js --configfile [config-file.json] --windowtitle [hc scaffold terminal window title]
```

## Configuration files

The configuration files each contain a single JSON object, which can contain any number of properties. The properties can be inserted into the commands as demonstrated in the example files provided.

The only required proerty is the `command` property. The `command` property holds an array of command objects. These command objects can have these properties:

- command  
  This holds the command. The first command in each configuration file will put the focus on the terminal window where the `hc scaffold` sub-command is to be run.
- timeout  
  The timeout in milliseconds to wait between this command and the next.
- comment  
  An optional comment, so it's a little easier reading the configuration file.

The commands are admittedly not very easy to read, but they each execute an `xdotool` command in order to put the focus on the proper terminal window, or send subsequent keystrokes to that terminal in order to run `hc scaffold`.

## Command-line options

- --configfile [configfile.json]  
  This is the location of the configuration file which holds the commands to run.
- --windowtitle [terminal window title]  
  This is the title of the terminal window in which the hc scaffold sub-commands are to be run.
- --dryrun  
  This will prevent the commands from running. The commands, and optionally their comments, will be printed to the current terminal, though.
- --comments  
  This will print the comments with the commands to the current terminal.

The example configuration files, when run in order, will duplicate the my_forum_app demo on the [Holochain Get Started page](https://developer.holochain.org/get-started/)

## TODO

- Make the configuration file more user-friendly.
- Add a configuration flag to log the executed commands.
- Make the whole things more robust. (This implementation is pretty hackish.)
- Add configuration files for the link-type sub-command.
- This has only been run on Ubuntu. Get it to run
- Add tests

## Requirements

xdotool

## License

[MIT](https://choosealicense.com/licenses/mit/)
