
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type String

class StringField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands() {

    let field = this.config;

    this.create_data_type_command();
    this.create_field_name_command();
    let is_visible = this.create_ui_visibility_command();

    if (is_visible) {

      // handle the ui widget selection; options:
      // TextArea
      // TextField
      if (!["textarea", "textfield"].includes(field.widget.toLowerCase())) {
        throw new Error(`Widget type for String field must be one of "TextArea" or "TextField", not "${field.widget}"`);
      }

      if (field.widget.toLowerCase() == "textfield") {
        this.commands.push({
          "command": `xdotool key Down`,
          "timeout": 500,
          "comment": `field "${field.name}": set ui widget to (${field.widget})`,
        });
      }

      this.commands.push({
        "command": `xdotool key Return`,
        "timeout": 500,
        "comment": `press return to select ${field.widget}`,
      });
    }

    return this.commands;
  }
}

module.exports.StringField = StringField;
