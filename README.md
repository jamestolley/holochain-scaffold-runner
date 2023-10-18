# Holochain scaffold runner

Holochain scaffold runner is used to automate the Holochain scaffolding process.

## Installation

```bash
> git clone https://github.com/jamestolley/holochain-scaffold-runner.git
> cd holochain-scaffold-runner
> npm install
```

## Usage

After installation, edit the configuration files as needed, open a terminal window in the directory you want to scaffold your app (or in which the app has already been created), and then run

```bash
> npm run scaffold -- --targetdir [target directory] --configfile [config-file.json] --windowtitle [holonix terminal window title]
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
- --targetdir [target directory]  
  The directory into which the scaffolding will be installed.
- --dryrun  
  This will prevent the commands from running. The commands, and optionally their comments, will be printed to the current terminal, though. This can be used to check the integrity of the configuration files.
- --comments  
  This will print the comments with the commands to the current terminal.
- --quiet  
  Prevent the printing of the commands to the terminal as they are being executed.
- --debug  
  Print some extra progress to the terminal. Overrides --quiet for those messages.

The example configuration files, when run in order, will duplicate the my_forum_app demo on the [Holochain Get Started page](https://developer.holochain.org/get-started/)

## TODO

- Command line option to log the executed commands.
- Add configuration files for the link-type sub-command.
- Run the prompts in an internal process.
- Run all files in a directory, instead of just one file per execution.
- Create tests for all types.
- Allow for more than one dna and more than one zome.
- Improve the --debug mode to accommodate different debug levels.
- Fix tests, test for bad input.
- Better input checking.
- Read the valid field widget types from the current template (instead of defaulting to the default templates).

## Testing

The included test actually doesn't work because there are sometimes unpredictable,
small differences between the resulting files and the files used as a reference.

For example, the following line may be placed either before or after an empty line in EditPost.svelte:

```code
import '@material/mwc-textfield';
```

There is, of course, no meaningful difference between the two versions, but this difference makes
it difficult to write tests for it, as the same behavior happens with different files in different
templates.

Since I see no easy way around this, if you wish to confirm that they system works, feel free
to test the output of the default configuration files by hand.

To do that, run the configuration files in order and run this diff command on the output you have
created, and the reference output in the test/reference_output/my_forum_app directory.

```bash
diff -Br --exclude=*node_modules* --exclude=*dna.yaml --exclude=*.git --exclude=*.holosr --exclude=*.cargo --exclude=*Cargo.lock  [the root directory for your holochain app] ./test/reference_outputs/my_forum_app
```

## Requirements

xdotool
This has only been tested on Ubuntu 22.04

## License

[MIT](https://choosealicense.com/licenses/mit/)
