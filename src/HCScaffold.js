const { readFileSync, existsSync, writeFileSync } = require('fs');
const { exec } = require('node:child_process');

// const { Field } = require('./HCScaffold/Field.js');
const { StringField } = require('./HCScaffold/Field/StringField.js');
const { BoolField } = require('./HCScaffold/Field/BoolField.js');
const { U32Field } = require('./HCScaffold/Field/U32Field.js');
const { I32Field } = require('./HCScaffold/Field/I32Field.js');
const { F32Field } = require('./HCScaffold/Field/F32Field.js');
const { TimestampField } = require('./HCScaffold/Field/TimestampField.js');
const { ActionHashField } = require('./HCScaffold/Field/ActionHashField.js');
const { EntryHashField } = require('./HCScaffold/Field/EntryHashField.js');
const { DnaHashField } = require('./HCScaffold/Field/DnaHashField.js');
const { AgentPubKeyField } = require('./HCScaffold/Field/AgentPubKeyField.js');
const { EnumField } = require('./HCScaffold/Field/EnumField.js');
const { OptionOfField } = require('./HCScaffold/Field/OptionOfField.js');
const { VectorOfField } = require('./HCScaffold/Field/VectorOfField.js');

class HCScaffold {
  constructor(argv) {

    this.args = this.checkArgs(argv);
    this.debug("this.args:", this.args);

    // create or open the .holosr configuration file here
    // dnas appear to be in alphabetical order
    // zomes and entry-types appear to be in the order they were created
    // so we are going to store the creation of each dna, zome, and entry-type
    // so we can refer to them later when we are creating the commands for our scaffold runner
    if (existsSync(`${this.args.targetdir}/.holosr`)) {
      this.dot_config = this.loadConfig({"configfile": `${this.args.targetdir}/.holosr`});
    } else {
      this.dot_config = {"https://github.com/jamestolley/holochain-scaffold-runner":"","dna":{},"zome":{},"entry-type":{}};
    }
  }

  run() {

    // setup
    const config = this.loadConfig(this.args);
    this.debug("config:", config);

    const commands = this.create_commands_from_configuration(config, this.args);
    
    this.debug("about to run the commands", commands);
    this.run_commands(commands, this.args);

    return true;
  }

  checkArgs(argv) {

    if ( typeof argv.targetdir   == 'undefined'
      || typeof argv.configfile  == 'undefined'
      || typeof argv.windowtitle == 'undefined') {
      console.log("USAGE: npm run scaffold -- --targetdir [target directory] --configfile [config filename] --windowtitle [window title]");
      process.exit();
    }
    
    // if (!existsSync(argv.targetdir)) {
    //   console.log("Warning: --targetdir '${argv.targetdir}' not found");
    //   // process.exit();
    // }
    
    if (!existsSync(argv.configfile)) {
      console.log("Configuration file --configfile '${argv.configfile}' not found");
      process.exit();
    }

    return argv;
  }

  loadConfig(args) {
  
    let filename = args.configfile;

    if (!/^(?:\/|~)/.test(filename)) {
      filename = `./${filename}`;
    }

    let configurationData;
    try {
      configurationData = readFileSync(filename, 'utf-8');
    } catch (e) {
      console.error(e);
      process.exit();
    }
  
    // parse the JSON and return the result
    try {
        return JSON.parse(configurationData);
    } catch (e) {
        console.error(e);
        process.exit();
    }
  }

  run_commands(commands, args) {

    if (commands.length) {
  
      // shift the first command and use it
      let this_command = commands.shift();
      let this_command_command = this_command.command;
  
      // print the command to console
      if (typeof args.quiet === "undefined" || typeof args.debug !== "undefined") {
        let formatted_command = this_command_command;
        if (formatted_command.length > 80) {
          formatted_command = formatted_command.slice(0,65) + "... (truncated)";
        }
        console.log(`running command: ${formatted_command}`);
        if (typeof this_command.comment != 'undefined' && typeof args.comments != 'undefined') {
          console.log(`\t // ${this_command.comment}`);
        }
      }
  
      // run the command, unless this is just a "dry run",
      //  that is, if it's just listing the commands and not running them.
      if (typeof args.dryrun == 'undefined') {
        let parts = this_command_command.match(/^hsr_internal:\s+(\S+)\s+(\S+)$/);
        if (parts) {
          // store dna, zome, or entry-type (name and timestamp)
          /* allowed command formats:
            "hsr_internal: dna name"
            "hsr_internal: zome name"
            "hsr_internal: entry-type name"
            config file format: {
              "dna|zome|entry-type": [{
                "timestamp": "name, e.g.:",
                "1234567890": "Post" // to sort a-z or by creation time
              }]
            }
          */
          this.writeHoloConfigFile(parts[1], parts[2]);
        } else {
          exec(this_command_command, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
          });
        }
      }
  
      // reexecute using the rest of the commands
      if (commands.length) {
        let hcscaffold = this;
        setTimeout(() => {
            hcscaffold.run_commands(commands, args)
          },  typeof this.args.dryrun === 'undefined'
              ? (typeof this.args.debug === "undefined"
                ? this_command.timeout
                : this_command.timeout * 3)
              : 1
        );
      }
    }
  }

  writeHoloConfigFile(key, value) {

    if (arguments.length) {
      let now = new Date().getTime();
      this.dot_config[key][now] = value;
    }

    let filename = `${this.args.targetdir}/.holosr`;
    try {
      if (existsSync(filename)) {
        writeFileSync(filename, JSON.stringify(this.dot_config));
      } else {
        writeFileSync(filename, JSON.stringify(this.dot_config), { flag: 'a' });
      }
    } catch (e) {
      console.error(`Failed to write ${filename} configuration file: ${e}`);
    } 

  }

  debug(...args) {
    if (typeof this.args.debug !== "undefined") {
      console.log(...args);
    }
  }

  create_commands_from_configuration(config, args) {

    let set_active_window_command = {
      "command": `xdotool search "${args.windowtitle}" windowactivate`,
      "timeout": 500,
      "comment": "This makes the proper terminal window active"
    };
    let commands = [set_active_window_command];

    this.debug("creating commands for type:", config.type);

    switch (config.type) {
      case 'web_app':
      case 'web-app':
        return this.create_commands_from_web_app_config(config, args, commands);
        break;
      case 'dna':
        return this.create_commands_from_dna_config(config, args, commands);
        break;
      case 'zome':
        return this.create_commands_from_zome_config(config, args, commands);
        break;
      case 'entry_type':
      case 'entry-type':
        return this.create_commands_from_entry_type_config(config, args, commands);
        break;
      case 'collection':
        return this.create_commands_from_collection_config(config, args, commands);
        break;
      case 'link_type':
      case 'link-type':
        return this.create_commands_from_link_type_config(config, args, commands);
        break;
      default:
        throw new Error(`Unknown configuration type ${config.type}`);
    }
  }

  create_commands_from_web_app_config(config, args, commands) {

    // run hc
    let run_hc_command = {
      "command": `xdotool type "nix run github:holochain/holochain#hc-scaffold -- web-app" && xdotool key Return`,
      "timeout": 20000,
      "comment": "this runs the scaffold app to initialize a web app; 20 seconds...?"
    };
    commands.push(run_hc_command);

    // app name
    if (!config.name.match || config.name.match(new RegExp('\\s'))) {
      throw new Error(`web_app names cannot have any whitespaces`);
    }
    let set_app_name_command = {
      "command": `xdotool type "${config.name}" && xdotool key Return`,
      "timeout": 1000
    };
    commands.push(set_app_name_command);

    // ui
    let repeats = {
      "Vue": 0,
      "Svelte": 1,
      "Lit": 2
    };
    if (!config.ui in repeats) {
      throw new Error(`Unknown config.ui "${config.ui}"; valid options: "Vue", "Svelte", or "Lit"`);
    }
    let down_key_command = "xdotool key Down && ";
    let select_ui_command = {
      "command": `${down_key_command.repeat(repeats[config.ui])}xdotool key Return`,
      "timeout": 1000,
      "comment": "Vue, Svelte, or Lit"
    };
    commands.push(select_ui_command);

    // dev environment - always yes
    let dev_test = !["YES","Yes","yes","Y","y",'on','On','ON',true].includes(config.setup_dev_environment);
    if (dev_test) {
      let no_to_setup_dev_command = {
        "command": "xdotool key Down", 
        "timeout": 2000,
        "comment": "choose no to setting up the dev environment"
      };
      commands.push(no_to_setup_dev_command);
    }

    // dev environment - always yes
    let setup_the_dev_env_command = {
      "command": "xdotool key Return", 
      "timeout": 2000,
      "comment": "confirm setting up the dev environment"
    };
    commands.push(setup_the_dev_env_command);

    // 
    let cd_to_the_app_dir_command = {
      "command": `xdotool type "cd ${config.name}" && xdotool key Return`,
      "timeout": 500,
      "comment": "cd to the new app directory"
    };
    commands.push(cd_to_the_app_dir_command);

    let nix_develop_command = {
      "command": `xdotool type "nix develop" && xdotool key Return`,
      "timeout": 10000,
      "comment": "10 seconds"
    };
    commands.push(nix_develop_command);

    let npm_install_command = {
      "command": `xdotool type "npm install" && xdotool key Return`,
      "timeout": 1000,
      "comment": "no need to wait // 5 * 60 * 1000 // 5 minutes?"
    };
    commands.push(npm_install_command);

    return commands;
  }

  create_commands_from_dna_config(config, args, commands) {

    let run_dna_scaffold_command = {
      "command": `xdotool type "hc scaffold dna" && xdotool key Return`,
      "timeout": 1000,
      "comment": "scaffolds the dna"
    };
    commands.push(run_dna_scaffold_command);

    let set_dna_name_command = {
      "command": `xdotool type "${config.name}" && xdotool key Return`,
      "timeout": 1000,
      "comment": "sets the dna name"
    };
    commands.push(set_dna_name_command);

    let store_to_dot_config_command = {
      "command": `hsr_internal: dna ${config.name}`,
      "timeout": 1000,
      "comment": "adds the dna name to the .config file"
    };
    commands.push(store_to_dot_config_command);

    return commands;
  }

  create_commands_from_zome_config(config, args, commands) {

    let run_scaffold_command = {
      "command": `xdotool type "hc scaffold zome" && xdotool key Return`,
      "timeout": 1000,
      "comment": "starts to scaffold the zome"
    };
    commands.push(run_scaffold_command);
    
    let down_key_command = "xdotool key Down && ";
    let down_key_counts = { "pair": 0, "integrity": 1, "coordinator": 2 };
    if (typeof down_key_counts[config.create] === "undefined") {
      throw new Error(``);
    }
    let repeats = down_key_counts[config.create];
    let create_pair_command = {
      "command": `${down_key_command.repeat(repeats)}xdotool key Return`,
      "timeout": 1000,
      "comment": "create a pair of zomes or only one kind"
    };
    commands.push(create_pair_command);
    
    if (!config.name.match || !config.name.match('[a-zA-Z]+(_[a-zA-Z]+)*')) {
      throw new Error(`Zome name "${config.name}" does not look like snake case`);
    }
    let set_zome_name_command = {
      "command": `xdotool type "${config.name}" && xdotool key Return`,
      "timeout": 1000,
      "comment": "sets the zome name"
    };
    commands.push(set_zome_name_command);
    
    // TODO make it possible to save the zomes in specified directories
    if (config.create === "pair") {
      let set_zome_directory_command = {
        "command": `xdotool type "y"`,
        "timeout": 1000,
        "comment": "put the zome/s in the default directory"
      };
      commands.push(set_zome_directory_command);
    }
    
    let set_directory_command = {
      "command": `xdotool type "y"`,
      "timeout": 1000,
      "comment": "put the zome/s in the default directory"
    };
    commands.push(set_directory_command);

    let store_to_dot_config_command = {
      "command": `hsr_internal: zome ${config.name}`,
      "timeout": 1000,
      "comment": "adds the zome name to the .config file"
    };
    commands.push(store_to_dot_config_command);

    return commands;
  }

  create_commands_from_entry_type_config(config, args, commands) {

    let scaffold_command = {
      "command": `xdotool type "hc scaffold entry-type" && xdotool key Return`,
      "timeout": 1000,
      "comment": "starts to scaffold the entry-type"
    };
    commands.push(scaffold_command);
    
    let enter_name_command = {
      "command": `xdotool type "${config.name}" && xdotool key Return`,
      "timeout": 1000,
      "comment": "sets the entry-type name (post)"
    };
    commands.push(enter_name_command);
    
    // configure the fields
    commands = this.create_commands_from_fields_config(config, args, commands);
    console.log(44);
    // crud
    if (config.crud.includes("Update") && config.crud.includes("Delete")) {

      let confirm_crud_both_command = {
        "command": "xdotool key Return",
        "timeout": 1000,
        "comment": "select CRUD options: Update and Delete"
      };
      commands.push(confirm_crud_both_command);

      let create_update_link = ["YES","Yes","yes","Y","y",'on','On','ON',true].includes(config.create_update_link);
      if (!create_update_link) {
        let confirm_recommended_command = {
          "command": "xdotool key Down",
          "timeout": 1000,
          "comment": "choose to not create a link on update"
        };
        commands.push(confirm_recommended_command);
      }
      let confirm_recommended_command = {
        "command": "xdotool key Return",
        "timeout": 1000,
        "comment": "confirm whether to creat a link on update"
      };
      commands.push(confirm_recommended_command);

    } else if (config.crud.includes("Update")) {

      let confirm_crud_update_command = {
        "command": "xdotool key Down && xdotool key space && xdotool key Return",
        "timeout": 1000,
        "comment": "select CRUD options: Update only"
      };
      commands.push(confirm_crud_update_command);

      let create_update_link = ["YES","Yes","yes","Y","y",'on','On','ON',true].includes(config.create_update_link);
      if (!create_update_link) {
        let confirm_recommended_command = {
          "command": "xdotool key Down",
          "timeout": 1000,
          "comment": "choose to not create a link on update"
        };
        commands.push(confirm_recommended_command);
      }
      let confirm_recommended_command = {
        "command": "xdotool key Return",
        "timeout": 1000,
        "comment": "confirm whether to creat a link on update"
      };
      commands.push(confirm_recommended_command);

    } else if (config.crud.includes("Delete")) {

      let confirm_crud_delete_command = {
        "command": "xdotool key space && xdotool key Return",
        "timeout": 1000,
        "comment": "select CRUD options: Delete only"
      };
      commands.push(confirm_crud_delete_command);

    } else { // neither

      let confirm_crud_neither_command = {
        "command": "xdotool key space && xdotool key Down && xdotool key space && xdotool key Return",
        "timeout": 1000,
        "comment": "select CRUD options: neither option"
      };
      commands.push(confirm_crud_neither_command);

    }

    let store_to_dot_config_command = {
      "command": `hsr_internal: entry-type ${config.name}`,
      "timeout": 1000,
      "comment": "adds the entry-type name to the .config file"
    };
    commands.push(store_to_dot_config_command);

    return commands;
  }

  create_commands_from_fields_config(config, args, commands) {

    for (let i = 0; i < config.fields.length; i++) {

      let field = config.fields[i];
      let field_object = null;

      switch (field.type.toLowerCase()) {
        case 'string':
          field_object = new StringField(field);
          break;
        case 'bool':
          field_object = new BoolField(field);
          break;
        case 'u32':
          field_object = new U32Field(field);
          break;
        case 'i32':
          field_object = new I32Field(field);
          break;
        case 'f32':
          field_object = new F32Field(field);
          break;
        case 'timestamp':
          field_object = new TimestampField(field);
          break;
        case 'actionhash':
          field_object = new ActionHashField(field);
          break;
        case 'entryhash':
          field_object = new EntryHashField(field);
          break;
        case 'dnahash':
          field_object = new DnaHashField(field);
          break;
        case 'agentpubkey':
          field_object = new AgentPubKeyField(field);
          break;
        case 'enum':
          field_object = new EnumField(field);
          break;
        case 'optionof...':
          field_object = new OptionOfField(field);
          break;
        case 'vectorof...':
          field_object = new VectorOfField(field);
          break;
        default:
          throw new Error(`Bad field type: "${field.type}"`);
      }

      // for ActionHash and EntryHash types, existing entry_types and down key counts
      let down_key_counts = this.get_down_keystroke_counts("entry-type");
      // this.debug("down_key_counts:", down_key_counts);
      // throw Error(43);
      commands.push(...field_object.get_commands(down_key_counts));

      // is this the final field?
      let final_field_answer = i < config.fields.length - 1 ? "y" : "n";
      let more_fields_command = {
        "command": `xdotool type "${final_field_answer}"`,
        "timeout": 1000,
        "comment": "more fields to enter?"
      };
      commands.push(more_fields_command);
    }

    return commands;

  }

  create_commands_from_collection_config(config, args, commands) {
    let scaffold_command = {
      "command": `xdotool type "hc scaffold collection" && xdotool key Return`,
      "timeout": 1000,
      "comment": "start the collection scaffolding tool"
    };
    commands.push(scaffold_command);

    let set_name_command = {
      "command": `xdotool type "${config.name}" && xdotool key Return`,
      "timeout": 1000,
      "comment": "sets the collection name"
    };
    commands.push(set_name_command);
    
    if (config.collection_type === "author") { // must equal "author"
      let choose_author_collection_type_command = {
        "command": "xdotool key Down && xdotool key Return",
        "timeout": 1000,
        "comment": "FIELD 1: choose the author collection type"
      };
      commands.push(choose_author_collection_type_command);
    } else if (config.collection_type === "global") {
      let choose_global_collection_type_command = {
        "command": "xdotool key Return",
        "timeout": 1000,
        "comment": "FIELD 1: choose the global collection type"
      };
      commands.push(choose_global_collection_type_command);
    } else {
      throw new Error(`Configuration entry "collection_type" must be one of ["global","author"], not "${config.collection_type}"`);
    }

    let down_key_counts = this.get_down_keystroke_counts("entry-type");
    let collection_entry_type = config.entry_type.toLowerCase();
    if (!collection_entry_type in down_key_counts) {
      throw new Error(`Cannot find entry_type ${collection_entry_type} in down_key_counts`, down_key_counts);
    }

    let down_key_command = "xdotool key Down && ";
    let choose_entry_type_command = {
      "command": `${down_key_command.repeat(down_key_counts[collection_entry_type])}xdotool key Return`,
      "timeout": 1000,
      "comment": "FIELD 1: choose entry type"
    };
    commands.push(choose_entry_type_command);

    return commands;
  }

  create_commands_from_link_type_config(config, args, commands) {
    let scaffold_command = {
      "command": `xdotool type "hc scaffold link-type" && xdotool key Return`,
      "timeout": 1000,
      "comment": "start the link-type scaffolding tool"
    };
    commands.push(scaffold_command);

    let key_down_counts = this.get_down_keystroke_counts("entry-type");
    
    // add "Agent" to the end of the list
    key_down_counts.agent = Object.keys(key_down_counts).length;
    let from_entry_type = config.from_entry_type.toLowerCase();
    let from_key_count = -1;
    if (from_entry_type in key_down_counts) {
      from_key_count = key_down_counts[from_entry_type];
    } else {
      throw new Error(`link: failed to find from_entry_type "${from_entry_type}" in `, key_down_counts);
    }

    let down_key_command = `xdotool key Down && `;
    let from_entry_type_command = {
      "command": `${down_key_command.repeat(from_key_count)}xdotool key Return`,
      "timeout": 1000,
      "comment": "create link: choose the from entry-type"
    };
    commands.push(from_entry_type_command);

    if (config.from_entry_type.toLowerCase() === "agent") {
      let agent_role_command = {
        "command": `xdotool type "${config.from_agent_role}" && xdotool key Return`,
        "timeout": 1000,
        "comment": "create link: choose agent role"
      };
      commands.push(agent_role_command);
    } else {
      if (!["ActionHash","EntryHash"].includes(config.from_hash_type)) {
        throw new Error(`link: from_hash_type must be one of ["ActionHash","EntryHash"], not "${config.from_hash_type}"`);
      }
      let hash_down_count = config.from_hash_type === "ActionHash" ? 0 : 1;
      let hash_type_command = {
        "command": `${down_key_command.repeat(hash_down_count)}xdotool key Return`,
        "timeout": 1000,
        "comment": "create link: choose the from hash type"
      };
      commands.push(hash_type_command);
    }

    // add "Agent" to the end of the list
    key_down_counts.none = Object.keys(key_down_counts).length;
    let to_entry_type = config.to_entry_type.toLowerCase();
    let to_key_count = -1;
    if (to_entry_type in key_down_counts) {
      to_key_count = key_down_counts[to_entry_type];
    } else {
      throw new Error(`link: failed to find to_entry_type "${to_entry_type}" in `, key_down_counts);
    }

    let to_entry_type_command = {
      "command": `${down_key_command.repeat(to_key_count)}xdotool key Return`,
      "timeout": 1000,
      "comment": "create link: choose the to entry-type"
    };
    commands.push(to_entry_type_command);

    if (config.to_entry_type !== "none") {
      if (config.to_entry_type.toLowerCase() === "agent") {
        let agent_role_command = {
          "command": `xdotool type "${config.to_agent_role}" && xdotool key Return`,
          "timeout": 1000,
          "comment": "create link: choose agent role"
        };
        commands.push(agent_role_command);
      } else {
        if (!["ActionHash","EntryHash"].includes(config.to_hash_type)) {
          throw new Error(`link: to_hash_type must be one of ["ActionHash","EntryHash"], not "${config.to_hash_type}"`);
        }
        let to_hash_down_count = config.to_hash_type === "ActionHash" ? 0 : 1;
        let to_hash_type_command = {
          "command": `${down_key_command.repeat(to_hash_down_count)}xdotool key Return`,
          "timeout": 1000,
          "comment": "create link: choose the to hash type"
        };
        commands.push(to_hash_type_command);
      }

      let test = ["YES","Yes","yes","Y","y",'on','On','ON',true].includes(config.bidireccional);
      let answer = test ? "y" : "n";
      let set_yes_no_command = {
        "command": `xdotool type "${answer}"`,
        "timeout": 1000,
        "comment": "create link: set bidireccional"
      };
      commands.push(set_yes_no_command);
    } else { // "none"
      let none_entry_type_command = {
        "command": `${down_key_command.repeat(key_down_counts.none)}xdotool key Return`,
        "timeout": 1000,
        "comment": "create link: choose none for to_entry_type"
      };
      commands.push(none_entry_type_command);

      const pascal_case = /^[A-Z][A-Za-z]*$/;
      if (!pascal_case.test(config.link_name)) {
        throw new Error(`link_name "${config.link_name}" must be in Pascal Case but isn't`);
      }
      let link_name_command = {
        "command": `xdotool type "${config.link_name}" && xdotool key Return`,
        "timeout": 1000,
        "comment": "create link: set the link name"
      };
      commands.push(link_name_command);
    }

    let test2 = ["YES","Yes","yes","Y","y",'on','On','ON',true].includes(config.deletable);
    let answer2 = test2 ? "y" : "n";
    let set_yes_no_command2 = {
      "command": `xdotool type "${answer2}"`,
      "timeout": 1000,
      "comment": "create link: set deletable"
    };
    commands.push(set_yes_no_command2);

    return commands;
  }

  // returns an object where the keys are the entry_types that already exist
  // and the values are the number of Down keystrokes needed to select that type,
  // in the ui (for ActionHash and EntryHash fields)
  get_down_keystroke_counts(kind) {

    if (kind === "entry-type") {
      let entry_types = this.dot_config["entry-type"];
      this.debug("entry_types", entry_types);
      let sorted_timestamps = Object.keys(entry_types).sort();
      this.debug("sorted_timestamps", sorted_timestamps);
      let down_key_counts = {};
      let i = 0;
      // for (let timestamp in sorted_timestamps) {
      sorted_timestamps.forEach(timestamp => {
        this.debug("timestamp", timestamp);
        let entry_type = entry_types[timestamp];
        this.debug("entry_type", entry_type);
        down_key_counts[entry_type] = i++;
      });
      this.debug("down_key_counts:", down_key_counts);
      return down_key_counts;
    } else { // for "dna" and "zome"
      throw new Error("Not yet implemented")
    }
  }
}

exports.HCScaffold = HCScaffold;
