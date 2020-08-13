/**
 * Category.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'categories',

  attributes: {

    name: {
      type: 'string',
      unique: true,
      required: true
    },
    featuredImage: {
      type: 'string',
      required: true
    }
  },

};

