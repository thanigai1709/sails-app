/**
 * TagController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    getallTags: async (req, res) => {
        try {
            const tags = await Tag.find();
            res.send(tags);
        } catch (err) {
            return res.serverError(err);
        }
    },

    getTagById: async (req, res) => {
        try {
            const tag = await Tag.find({ id: req.params.id });
            res.send(tag.length > 0 ? tag : { msg: `tag id ${req.params.id} not found` });
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    createTag: async (req, res) => {
        try {
            res.send(await Tag.create({ name: req.body.name }).fetch());
        } catch (err) {
            if (err && err.code === 'E_UNIQUE')
                return res.status(409).send({ error: err.code, message: `Tag ${req.body.name} Already Exists` });
            else if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    updateTag: async (req, res) => {
        try {
            res.send(await Tag.update({ id: req.body.id })
                .set({ name: req.body.name })
                .fetch());
        } catch (err) {
            if (err && err.code === 'E_UNIQUE')
                return res.status(409).send({ error: err.code, message: `Tag ${req.body.name} Already Exists` });
            else if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    deleteTag: async (req, res) => {
        try {
            if (await Tag.destroyOne({ id: req.params.id }))
                res.send({ msg: `Tag id#${req.params.id} deleted sucessfuly` });
            else
                res.send({ msg: `Tag id#${req.params.id} does not exists` });
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    }


};

