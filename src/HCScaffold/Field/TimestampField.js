
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type Timestamp

class TimestampField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands(down_keystroke_counts) {

    let field = this.config;

    this.create_data_type_command();
    this.create_field_name_command();
    this.create_ui_visibility_command();
    this.create_return_command(`field "${field.name}": use DateTimePicker as widget type`);

    return this.commands;
  }
}

module.exports.TimestampField = TimestampField;
