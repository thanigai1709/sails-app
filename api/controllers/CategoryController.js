/**
 * CategoryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


const fs = require('fs');
const path = require('path');
const url = require('url');
const _rootDir = require('app-root-path');
const baseUrl = sails.config.globals.ROOT_URL;

module.exports = {

    categories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.send(categories);
        } catch (err) {
            return res.serverError(err);
        }
    },

    create: async (req, res) => {
        try {
            const tmp = await Category.create({
                name: req.body.name,
                featuredImage: __dirname
            }).fetch();
            const featuredImage = req.file('featuredImage');
            const filePath = path.join('uploads', `${Category.tableName}`);
            const fileName = tmp.name.toLowerCase() + `-${Category.tableName}-featured-image.jpg`;
            handleSingleFileUpload(featuredImage, filePath, fileName).then(files => {
                const filePath = url.resolve(baseUrl, `/uploads/${Category.tableName}/${fileName}`);
                updateFilePath(tmp.id, filePath)
                    .then(data => {
                        res.send(data);
                    }).catch(err => {
                        // deleting the updated record
                        rollBack(tmp.id)
                            .then(msg => { return res.serverError({ error: err, rollback: 'completed' }) })
                            .catch(err => { return res.serverError({ error: err, rollback: 'failed' }) })
                    });

            }).catch(err => {
                // deleting the updated record
                rollBack(tmp.id)
                    .then(msg => { return res.serverError({ error: msg, rollback: 'completed' }) })
                    .catch(err => { return res.serverError({ error: err, rollback: 'failed' }) })
            });
        } catch (err) {
            if (err && err.code === 'E_UNIQUE')
                return res.status(409).send({ error: err.code, message: 'Category Already Exists' });
            else if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const category = await Category.find({ id: req.params.id });
            res.send(category.length > 0 ? category : { msg: `category id ${req.params.id} not found` });
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const category = await Category.find({ id: req.params.id });
            if (category.length <= 0)
                return res.send({ message: `category id ${req.params.id} not found` });
            filePath = path.join(_rootDir + '/assets', url.parse(category[0].featuredImage).pathname);
            fs.unlink(filePath, async (err) => {
                if (err) return res.serverError(err);
                await Category.destroyOne({ id: req.params.id });
                res.send({ msg: `Category ${req.params.id} deleted sucessfuly` });
            });
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    updateCategory: async (req, res) => {
        try {
            const tmp = await Category.find({ id: req.body.id });
            if (tmp.length <= 0)
                return res.send({ message: `category id ${req.body.id} not found` });
            const updatedRec = await Category.update({ id: req.body.id })
                .set({
                    name: req.body.name
                }).fetch();
            filePath = path.join(_rootDir + '/assets', url.parse(tmp[0].featuredImage).pathname);
            fs.unlink(filePath, (err) => {
                if (err) return res.serverError(err);
                const featuredImage = req.file('featuredImage');
                const filePath = path.join('uploads', `${Category.tableName}`);
                const fileName = updatedRec[0].name.toLowerCase() + `-${Category.tableName}-featured-image.jpg`;
                handleSingleFileUpload(featuredImage, filePath, fileName).then(files => {
                    const protocol = req.connection.encrypted ? 'https' : 'http';
                    const baseUrl = protocol + '://' + req.headers.host + '/';
                    const filePath = url.resolve(baseUrl, `/uploads/categories/${fileName}`);
                    updateFilePath(tmp[0].id, filePath)
                        .then(data => {
                            res.send(data);
                        });
                });
            });
        } catch (err) {
            if (err && err.code === 'E_UNIQUE')
                return res.status(409).send({ error: err.code, message: 'Category Already Exists' });
            else if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    }

};

// helper functions
function handleSingleFileUpload(uploadFile, filePath, fileName) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync('../../assets/' + filePath))
            // creating the directory if it doestnt exists
            fs.mkdir(filePath, { recursive: true }, err => {
                if (err) { reject(err); return; }
            });
        uploadFile.upload({ dirname: '../../assets/' + filePath, saveAs: fileName }, (err, files) => {
            console.log('file uploaded');
            (err) ? (reject(err)) : (resolve(files));
        });
    });
}

async function updateFilePath(updateId, filePath) {
    try {
        return await Category.update({ id: updateId })
            .set({ featuredImage: filePath })
            .fetch();
    } catch (err) {
        throw new Error(err)
    }
}

async function rollBack(rollBackId) {
    try {
        return await Category.destroy({ id: rollBackId }).fetch();
    } catch (err) {
        throw new Error(err)
    }
}
