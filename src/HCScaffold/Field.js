
// Parent class for the classes which will handle creating
// the command arrays for creating the entry-type data fields, widgets, and links
// const { StringField } = require('./Field/StringField.js');
// const { BoolField } = require('./Field/BoolField.js');
// const { U32Field } = require('./Field/U32Field.js');
// const { I32Field } = require('./Field/I32Field.js');
// const { F32Field } = require('./Field/F32Field.js');
// const { TimestampField } = require('./Field/TimestampField.js');
// const { ActionHashField } = require('./Field/ActionHashField.js');
// const { EntryHashField } = require('./Field/EntryHashField.js');
// const { DnaHashField } = require('./Field/DnaHashField.js');
// const { AgentPubKeyField } = require('./Field/AgentPubKeyField.js');
// const { EnumField } = require('./Field/EnumField.js');
// const { OptionOfField } = require('./Field/OptionOfField.js');
// const { VectorOfField } = require('./Field/VectorOfField.js');

class Field {
  constructor(field) {

    this.config = field;
    this.commands = [];
  }

  create_data_type_command(type, comment) {

    let field = this.config;

    type = type ? type : field.type;

    comment = comment ? comment : `field "${field.name}": set data type (${type})`;

    // for each data type, downs gives the number of down arrows to press.
    // // the other keys, for the available ui widget types, give the down arrows for those.
    let repeats_for_type = {
      "String":       { "downs": 0, "TextArea": 0, "TextField": 1 },
      "bool":         { "downs": 1 }, // Checkbox
      "u32":          { "downs": 2 }, // Slider
      "i32":          { "downs": 3 }, // Slider
      "f32":          { "downs": 4 }, // Slider
      "Timestamp":    { "downs": 5 }, // DateTimePicker
      "ActionHash":   { "downs": 6 }, // 
      "EntryHash":    { "downs": 7 }, // 
      "DnaHash":      { "downs": 8 }, // 
      "AgentPubKey":  { "downs": 9 }, // 
      "Enum":         { "downs": 10 }, // 
      "Option of...": { "downs": 11 }, // String .. Enum
      "Vector of...": { "downs": 12 }, //  String .. Enum
    };

    let valid_types = Object.keys(repeats_for_type);
    if (!valid_types.includes(type)) {
      throw new Error(`field ${field.name}'s type (${type}) is not one of [${valid_types.join(', ')}]`);
    }

    let down_key_command = "xdotool key Down && ";
    this.commands.push({
      "command": `${down_key_command.repeat(repeats_for_type[type].downs)}xdotool key Return`,
      "timeout": 1000,
      "comment": comment
    });
  }

  create_field_name_command(name, comment) {

    let field = this.config;

    let this_name = field.name;
    if (name) {
      this_name = name;
    }

    let this_comment = `field "${this_name}": set field name`;
    if (comment) {
      this_comment = comment;
    }

    let clear_default_name_command = {
      "command": `${"xdotool key BackSpace && ".repeat(15)}xdotool key BackSpace`,
      "timeout": 1000,
      "comment": "clear default name, if any"
    };
    this.commands.push(clear_default_name_command);

    let set_field_name_command = {
      "command": `xdotool type "${this_name}" && xdotool key Return`,
      "timeout": 1000,
      "comment": comment
    };
    this.commands.push(set_field_name_command);
  }

  create_ui_visibility_command() {

    let field = this.config;

    let test = ["YES","Yes","yes","Y","y",true].includes(field.visible);

    return this.create_yes_no_command(test, `field "${field.name}": set ui visibility`);
  }

  create_yes_no_command(test, comment) {

    let answer = test ? "y" : "n";

    let set_yes_no_command = {
      "command": `xdotool type "${answer}"`,
      "timeout": 1000,
      "comment": comment
    };
    this.commands.push(set_yes_no_command);

    return test;
  }

  create_return_command(comment) {

    if (!comment) {
      comment = "Pressing return";
    }

    let return_command = {
      "command": `xdotool key Return`,
      "timeout": 1000,
      "comment": comment
    };

    this.commands.push(return_command);
  }
}

module.exports.Field = Field;
