/**
 * ProducttagsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    attachTags: async (req, res) => {
        try {
            const productId = req.body.product_id;
            const productTags = req.body.tags;
            const createTags = Array();
            productTags.forEach(element => {
                createTags.push({ tag: element, products: productId })
            });
            const tagsAttached = await Producttags.createEach(createTags).fetch();
            res.send(tagsAttached);
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }

    },
    removeTags: async (req, res) => {
        try {
            const deletedTags = await Producttags.destroy({ id: req.params.id }).fetch();
            (deletedTags.length > 0) ? (res.send({ message: `Deleted successfully`, deletedrecords: deletedTags })) : (res.send({ message: `tag not found` }));
        } catch{
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    }


};

