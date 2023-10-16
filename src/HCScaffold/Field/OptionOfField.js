
const { Field } = require("../Field.js");

// Class for creating the command arrays for fields of type OptionOf

class OptionOfField extends Field {
  constructor(field) {
    super(field);
  }
}

module.exports.OptionOfField = OptionOfField;
