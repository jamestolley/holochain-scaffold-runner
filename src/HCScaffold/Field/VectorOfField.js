
const { Field } = require("../Field.js");
const { EnumField } = require('./EnumField.js');
const { StringField } = require('./StringField.js');

// Class for creating the command arrays for fields of type VectorOf

class VectorOfField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands(down_keystroke_counts) {

    let field = this.config;

    this.create_data_type_command();

    let comment = `field "${field.name}": set vector to be of type "${field.of_type.type}"`;
    this.create_data_type_command(field.of_type.type, comment);

    if (field.of_type.type === "Enum") {
      let enum_field = new EnumField(field.of_type);
      this.commands.push(...enum_field.get_commands(down_keystroke_counts));
    } else if (field.of_type.type === "String") {
      let string_field = new StringField(field.of_type);
      this.commands.push(...string_field.get_commands());
    } else { // all other types have only one widget type, so key Return
      this.create_return_command(`field "${field.name}": accept default widget`);
    }

    return this.commands;
  }
}

module.exports.VectorOfField = VectorOfField;
