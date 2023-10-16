
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type Enum

class EnumField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands(down_keystroke_counts) {

    let field = this.config;

    this.create_data_type_command();

    const pascal_case = /^[A-Z][A-Za-z]*$/;
    let this_comment = `field: "${field.name}": set enum name`;
    if (!pascal_case.test(field.enum_name)) {
      throw new Error(`Enum name "${field.enum_name}" must be in Pascal Case but isn't`);
    }
    this.create_field_name_command(field.enum_name, this_comment); // must be Enum (Pascal) case

    // go through the variants
    for (let i = 0; i < variants.length; i++) {
      let comment = `field "${field.name}": set enum variant name to "${variant.name}"`;

      if (!pascal_case.test(variant.name)) {
        throw new Error(`Enum variant name "${variant.name}" must be in Pascal Case but isn't`);
      }
      this.create_field_name_command(variant.name, comment);

      let test = i < variants.length - 1;
      let yes_no_comment = `field "${field.name}": ` + (test ? "yes" : "no") + " more fields";
      this.create_yes_no_command(test, yes_no_comment);
    }

    this.create_field_name_command();
    this.create_ui_visibility_command();
    this.create_return_command(`field "${field.name}": use Select as widget type`);

    return this.commands;
  }
}

module.exports.EnumField = EnumField;
