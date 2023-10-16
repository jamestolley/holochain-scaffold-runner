
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type AgentPubKey

class AgentPubKeyField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands(down_keystroke_counts) {

    let field = this.config;

    this.create_data_type_command();
    this.create_yes_no_command(true, `field "${field.name}": Create link from AgentPubKey`);

    let comment = `field "${field.name}": set agent role`;
    this.create_field_name_command(field.agent_role, comment);

    this.create_field_name_command(); // or just press return to accept the default

    return this.commands;
  }
}

module.exports.AgentPubKeyField = AgentPubKeyField;
