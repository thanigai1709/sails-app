/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/homepage' },

  // Category End points

  'GET /api/v1/categories': 'CategoryController.categories',
  'GET /api/v1/categories/:id': 'CategoryController.getCategoryById',
  'POST /api/v1/categories': 'CategoryController.create',
  'PUT /api/v1/categories': 'CategoryController.updateCategory',
  'DELETE /api/v1/categories/:id': 'CategoryController.deleteCategory',

  // Tags End points
  'GET /api/v1/tags': 'TagController.getallTags',
  'GET /api/v1/tags/:id': 'TagController.getTagById',
  'POST /api/v1/tags': 'TagController.createTag',
  'PUT /api/v1/tags': 'TagController.updateTag',
  'DELETE /api/v1/tags/:id': 'TagController.deleteTag',

  // Products End Points
  'GET /api/v1/products': 'ProductsController.getAllProducts',
  'GET /api/v1/products/filter': 'ProductsController.productsFilter',
  'GET /api/v1/products/:id': 'ProductsController.getProductById',
  'GET /api/v1/products/search/:slug': 'ProductsController.searchProduct',
  'POST /api/v1/products': 'ProductsController.createProduct',
  'PUT /api/v1/products': 'ProductsController.updateProduct',
  'DELETE /api/v1/products/:id': 'ProductsController.deleteProduct',

  // Product Tags End points
  'POST /api/v1/producttags': 'ProducttagsController.attachTags',
  'DELETE /api/v1/producttags/:id': 'ProducttagsController.removeTags'

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
