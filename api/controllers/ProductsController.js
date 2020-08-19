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
                    featuredImage: 'asdasdasdas',
                    gallery: 'asdasdas',
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
    
    },
    deleteProduct: async (req, res) => {

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