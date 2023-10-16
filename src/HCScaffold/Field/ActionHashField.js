
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type ActionHash

class ActionHashField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands(down_keystroke_counts) {

    let field = this.config;

    this.create_data_type_command();
    this.create_yes_no_command(true, `field "${field.name}": Create link from ActionHash`);

    if (typeof down_keystroke_counts[field.entry_type.toLowerCase()] === "undefined") {
      console.error("down_keystroke_counts: ", down_keystroke_counts);
      throw new Error(`Failed to find "${field.entry_type.toLowerCase()}" in down_keystroke_counts`);
    }
    let down_keystrokes_count = down_keystroke_counts[field.entry_type.toLowerCase()];

    let down_key_command = "xdotool key Down && ";
    this.commands.push({
      "command": `${down_key_command.repeat(down_keystrokes_count)}xdotool key Return`,
      "timeout": 1000,
      "comment": `field ${field.name}: choose ${field.entry_type} entry type`
    });

    this.create_field_name_command();

    return this.commands;
  }
}

module.exports.ActionHashField = ActionHashField;
