/**
 * Tag.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'tags',

  attributes: {
    name: {
      type: 'string',
      unique: true,
      required: true
    }
  },

};

