
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type f32

class F32Field extends Field {
  constructor(field) {
    super(field);
  }

  get_commands(down_keystroke_counts) {

    let field = this.config;

    this.create_data_type_command();
    this.create_field_name_command();
    this.create_ui_visibility_command();
    this.create_return_command(`field "${field.name}": use slider as widget type`);

    return this.commands;
  }
}

module.exports.F32Field = F32Field;