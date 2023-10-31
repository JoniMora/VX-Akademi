const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Product = require('../models/product')
const HttpError = require('../models/http-error');

const getProductById = async (req, res, next) => {
    const productId = req.params.pid;
  
    let product;
    try {
      product = await Product.findById(productId);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not find a place.',
        500
      );
      return next(error);
    }
  
    if (!product) {
      const error = new HttpError(
        'Could not find place for the provided id.',
        404
      );
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
  
exports.getProductById = getProductById;
exports.createProduct = createProduct;