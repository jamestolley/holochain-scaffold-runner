
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type VectorOf

class VectorOfField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands() {

    let field = this.config;

    this.create_data_type_command();

    let comment = `field "${field.name}": set vector to be of type "${field.of_type}"`;
    this.create_data_type_command(field.of_type, comment);

    /*
    example configration file:
    {
      "type": "entry_type",
      "name": "example",
      "fields": [{
        "type": "VectorOf...",
        "of_type": {
          "type": "String",
          "name": "comment_content",
          "visible": true,
          "widget": "Textarea"
        },
        "visible": "y"
      }],
      "crud": ["Delete"],
      "#create link": "always yes"
    }
    */
    if (field.of_type.type === "Enum") {

    } else if (field.of_type.type === "String") {

    } else { // all other types have only one widget type, so key Return
      this.create_return_command(`field "${field.name}": accept default widget`);
    }


    let this_comment = `field: "${field.name}": set enum name`;
    this.create_field_name_command(field.enum_name, this_comment); // must be Enum (Pascal) case

    // go through the variants
    for (let i = 0; i < variants.length; i++) {
      let comment = `field "${field.name}": set enum variant name to "${variant.name}"`;
      this.create_field_name_command(variant.name, comment); // must be Enum (Pascal) case

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

module.exports.VectorOfField = VectorOfField;
