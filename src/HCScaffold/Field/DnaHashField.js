
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type DnaHash

class DnaHashField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands(down_keystroke_counts) {

    this.create_data_type_command();
    this.create_field_name_command();

    return this.commands;
  }
}

module.exports.DnaHashField = DnaHashField;
