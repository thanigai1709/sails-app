/**
 * Products.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    status: {
      type: 'boolean',
      defaultsTo: true
    },
    sku: {
      type: 'string',
      required: true,
      unique: true
    },
    stock: {
      type: 'number',
      defaultsTo: 0
    },
    name: {
      type: 'string',
      required: true
    },
    price: {
      type: 'number',
      columnType: 'float',
      defaultsTo: 0.00
    },
    featuredImage: {
      type: 'string',
      required: true
    },
    gallery: {
      type: 'json',
    },
    category: {
      model: 'category'
    },
    tags: {
      collection: 'tag',
      via: 'products',
      through: 'producttags'
    }
  },

};

