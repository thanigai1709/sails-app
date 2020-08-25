/**
 * ProductsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs');
const path = require('path');
const url = require('url');
const _rootDir = require('app-root-path')
const baseUrl = sails.config.globals.ROOT_URL;
const rmDir = require('rimraf');
module.exports = {
    createProduct: async (req, res) => {
        try {
            const temp = await Products
                .create({
                    status: req.body.status,
                    sku: req.body.sku,
                    stock: req.body.stock,
                    name: req.body.name,
                    price: req.body.price,
                    featuredImage: 'dummy',
                    gallery: 'dummy',
                    category: req.body.category_id
                })
                .fetch();
            const featuredImage = req.file('featuredImage');
            const gallery = req.file('gallery');
            const featuredImageFilePath = path.join('uploads', `${Products.tableName}`, `${temp.id}`, 'featuredimage');
            const galleryFilePath = path.join('uploads', `${Products.tableName}`, `${temp.id}`, 'gallery');
            const fileName = temp.name.toLowerCase();
            Promise.all([handleFeaturedImageUpload(featuredImage, featuredImageFilePath, fileName), handleGalleryUpload(gallery, galleryFilePath, fileName)])
                .then(files => {
                    let galleyUrl = Array();
                    files[1].forEach(element => {
                        galleyUrl.push(url.resolve(baseUrl, `/uploads/${Products.tableName}/${temp.id}/gallery/${element}`));
                    });
                    Promise.all([updateImageUrl(temp.id, url.resolve(baseUrl, `/uploads/${Products.tableName}/${temp.id}/featuredimage/${files[0]}`)), updateGalleryUrl(temp.id, galleyUrl)])
                        .then(async (values) => {
                            res.send(await Products.find({ id: temp.id }));
                        })
                });

        } catch (err) {
            if (err && err.code === 'E_UNIQUE')
                return res.status(409).send({ error: err.code, message: `Product SKU ${req.body.sku} Already Exists` });
            else if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    getAllProducts: async (req, res) => {
        try {
            res.send(await Products.find().populate('category').populate('tags'));
        } catch (err) {
            return res.serverError(err);
        }
    },

    productsFilter: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = {};
        const sortBy = req.query.sort || 'createdAt DESC';
        const search = req.query.search || '';
        results.records_found = await Products.count({
            where: { name: { contains: search } },
            where: { sku: { contains: search } },
        });
        results.current_page = page;
        if (req.query.search) { results.search_results_for = `showing results for ${search}` }
        if (endIndex < results.records_found) { results.next = { page: page + 1, limit: limit } }
        if (startIndex > 0) { results.prev = { page: page - 1, limit: limit } }
        try {
            results.results = await Products.find({
                where: { name: { contains: search } },
                where: { sku: { contains: search } },
            })
                .limit(limit)
                .skip(startIndex)
                .sort(sortBy)
                .populate('category')
                .populate('tags');
            results.page_record_count = results.results.length;
            results.page_count = Math.ceil(results.records_found / limit);
            res.send(results);
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    getProductById: async (req, res) => {
        try {
            const products = await Products.find({ id: req.params.id });
            res.send(products.length > 0 ? products : { msg: `product ${req.params.id} not found` });
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    searchProduct: async (req, res) => {
        try {
            const products = await Products.find({
                name: { contains: req.params.slug }
            });
            res.send(products.length > 0 ? products : { msg: `no products found under the term ${req.params.slug}` });
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    updateProduct: async (req, res) => {
        try {
            res.send(await Products.update({ id: req.body.id })
                .set({
                    name: req.body.name,
                    status: req.body.status,
                    sku: req.body.sku,
                    stock: req.body.stock,
                    price: req.body.price
                })
                .fetch());
        } catch (err) {
            if (err && err.code === 'E_UNIQUE')
                return res.status(409).send({ error: err.code, message: `Product SKU ${req.body.sku} Already Exists` });
            else if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const deleteProduct = await Products.find({ id: req.params.id });
            if (deleteProduct.length <= 0)
                return res.send({ message: `product id ${req.params.id} not found` });
            const dir = path.join(_rootDir.toString(), 'assets', 'uploads', `${Products.tableName}`, `${deleteProduct[0].id}`);
            rmDir(dir, async (err) => {
                if (err) throw err;
                await Products.destroyOne({ id: deleteProduct[0].id });
                res.send({ message: `record deleted sucessfuly`, deleted_record: deleteProduct });
            });
        } catch (err) {
            if (err && err.name === 'UsageError')
                return res.badRequest({ error: err.code, message: 'Invalid Request Format' });
            else if (err)
                return res.serverError(err);
        }
    }

};

function handleFeaturedImageUpload(uploadFile, filePath, fileName) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync('../../assets/' + filePath))
            console.log('creating directory' + filePath);
        // creating the directory if it doestnt exists
        fs.mkdir(filePath, { recursive: true }, err => {
            if (err) { reject(err); return; }
        });
        uploadFile.upload({
            dirname: '../../assets/' + filePath,
            saveAs: fileName + `${path.extname(uploadFile._files[0].stream.filename)}`
        }, (err, files) => {
            (err) ? (reject(err)) : (resolve(`${fileName + path.extname(uploadFile._files[0].stream.filename)}`));
        });
    });
}

function handleGalleryUpload(uploadFile, filePath, fileName) {
    let i = 1;
    let galleryLinks = Array();
    return new Promise((resolve, reject) => {
        if (fs.existsSync('../../assets/' + filePath))
            // creating the directory if it doestnt exists
            fs.mkdir(filePath, { recursive: true }, err => {
                if (err) { reject(err); return; }
            });
        uploadFile.upload({
            dirname: '../../assets/' + filePath, saveAs: (file, next) => {
                next(undefined, `${fileName}-${i}${path.extname(file.filename)}`);
                galleryLinks.push(`${fileName}-${i}${path.extname(file.filename)}`)
                i++;
                return;
            }
        }, async (err, files) => {
            (err) ? (reject(err)) : (resolve(galleryLinks));
        });
    });
}

async function updateImageUrl(updateId, urlPath) {
    try {
        return await Products.update({ id: updateId })
            .set({
                featuredImage: urlPath
            })
            .fetch();
    } catch (err) {
        throw new Error(err)
    }
}

async function updateGalleryUrl(updateId, urlPath) {
    try {
        return await Products.update({ id: updateId })
            .set({
                gallery: { urls: urlPath }
            })
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