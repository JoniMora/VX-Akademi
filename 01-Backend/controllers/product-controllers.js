const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Product = require('../models/product')
const HttpError = require('../models/http-error');

const getAllProducts = async (req, res, next) => {
    let products;
    try {
        products = await Product.find(); 

        res.status(200).json({ products: products });
    } catch (err) {
        const error = new HttpError('Could not retrieve products.', 500);
        return next(error);
    }
};

const getProductById = async (req, res, next) => {
    const productId = req.params.pid;
  
    let product;
    try {
        product = await Product.findById(productId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update product.', 500);
        return next(error);
    }
  
    if (!product) {
        const error = new HttpError('Could not find product for this id.', 404);
        return next(error);
    }
  
    res.json({ product: product.toObject({ getters: true }) });
};


const createProduct = async (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
  
    const { name, description, price, count_in_stock, image, quantity, category } = req.body;

    const newProduct = new Product({
        name,
        description,
        price,
        count_in_stock,
        image,
        quantity,
        category: category || null,
    });

    let session
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        await newProduct.save({ session });
        
        await session.commitTransaction();
    } catch (err) {
        if (session) {
            session.abortTransaction();
        }
        return next(new HttpError('Creating product failed, please try again.', 500));
    } finally {
        if (session) {
            session.endSession();
        }
    }

    res.status(201).json({ product: newProduct.toObject({ getters: true }) });
};

const updateProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
  
    const { name, description, price, count_in_stock, image, quantity, category } = req.body;
    const productID = req.params.pid;
  
    let product;
    try {
        product = await Product.findById(productID);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update product.', 500);
        return next(error);
    }
  
    product.name = name;
    product.description = description;
    product.price = price;
    product.count_in_stock = count_in_stock;
    product.image = image;
    product.quantity = quantity;
    product.category = category;
  
    try {
        await product.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update product.', 500);
        return next(error);
    }
  
    res.status(200).json({ product: product.toObject({ getters: true }) });
};
  
const deleteProduct = async (req, res, next) => {
    const productID = req.params.pid;

    try {
        const product = await Product.findById(productID);

        if (!product) {
            const error = new HttpError('Could not find product for this id.', 404);
            return next(error);
        }

        await product.remove();

        res.status(200).json({ message: 'Deleted product.' });
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete product.', 500);
        return next(error);
    }
};

  
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
