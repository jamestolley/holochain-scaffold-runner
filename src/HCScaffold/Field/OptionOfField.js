
const { Field } = require("../Field.js");
const { StringField } = require('./StringField.js');
const { BoolField } = require('./BoolField.js');
const { U32Field } = require('./U32Field.js');
const { I32Field } = require('./I32Field.js');
const { F32Field } = require('./F32Field.js');
const { TimestampField } = require('./TimestampField.js');
const { ActionHashField } = require('./ActionHashField.js');
const { EntryHashField } = require('./EntryHashField.js');
const { DnaHashField } = require('./DnaHashField.js');
const { AgentPubKeyField } = require('./AgentPubKeyField.js');
const { EnumField } = require('./EnumField.js');

// Class for creating the command arrays for fields of type OptionOf

class OptionOfField extends Field {
  constructor(field) {
    super(field);
  }

  get_commands(down_keystroke_counts) {

    let field = this.config;

    this.create_data_type_command();

    let comment = `field "${field.name}": set option to be of type "${field.of_type.type}"`;
    this.create_data_type_command(field.of_type.type, comment);

    let field_object = null;

    switch (field.of_type.type.toLowerCase()) {
      case 'string':
        field_object = new StringField(field.of_type);
        break;
      case 'bool':
        field_object = new BoolField(field.of_type);
        break;
      case 'u32':
        field_object = new U32Field(field.of_type);
        break;
      case 'i32':
        field_object = new I32Field(field.of_type);
        break;
      case 'f32':
        field_object = new F32Field(field.of_type);
        break;
      case 'timestamp':
        field_object = new TimestampField(field.of_type);
        break;
      case 'actionhash':
        field_object = new ActionHashField(field.of_type);
        break;
      case 'entryhash':
        field_object = new EntryHashField(field.of_type);
        break;
      case 'dnahash':
        field_object = new DnaHashField(field.of_type);
        break;
      case 'agentpubkey':
        field_object = new AgentPubKeyField(field.of_type);
        break;
      case 'enum':
        field_object = new EnumField(field.of_type);
        break;
      default:
        throw new Error(`Bad option field type: "${field.of_type.type}"`);
    }

    this.commands.push(...field_object.get_commands(down_keystroke_counts));

    return this.commands;
  }
}

module.exports.OptionOfField = OptionOfField;
