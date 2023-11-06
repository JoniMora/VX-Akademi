const mongoose = require('mongoose')
const { validationResult } = require('express-validator')

const Product = require('../models/product')
const HttpError = require('../models/http-error')

const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find()

        res.status(200).json({ products })
    } catch (err) {
        return next(new HttpError('Could not retrieve products.', 500))
    }
}

const getProductById = async (req, res, next) => {
    const productID = req.params.pid
    try {
        const product = await Product.findById(productID);
        
        if (!product) {
            return next(new HttpError('Could not find product for this id.', 404))
        }
        
        res.json({ product: product.toObject({ getters: true }) })
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update product.', 500));
    }
}

const createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req) 
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }
    
        const { name, description, price, count_in_stock, image, quantity, category } = req.body

        const newProduct = new Product({
            name,
            description,
            price,
            count_in_stock,
            image,
            quantity,
            category: category || null,
        })

        await newProduct.save()

        res.status(201).json({ product: newProduct.toObject({ getters: true }) })
    } catch (err) {
        return next(new HttpError('Creating product failed, please try again.', 500))
    } 
}

const updateProduct = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422))
    }
  
    const { name, description, price, count_in_stock, image, quantity, category } = req.body
    const productID = req.params.pid
  
    try {
        const product = await Product.findById(productID)
        if (!product) {
            return next(new HttpError('Could not find product for this id.', 404))
        }
   
        product.name = name
        product.description = description
        product.price = price
        product.count_in_stock = count_in_stock
        product.image = image
        product.quantity = quantity
        product.category = category
      
        await product.save()
        res.status(200).json({ product: product.toObject({ getters: true }) })
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update product.', 500))
    }
}
  
const deleteProduct = async (req, res, next) => {
    const productID = req.params.pid

    try {
        const product = await Product.findById(productID);
        if (!product) {
            return next(new HttpError('Could not find product for this id.', 404))
        }

        await product.remove()

        res.status(200).json({ message: 'Deleted product.' })
    } catch (err) {
        return next(new HttpError('Something went wrong, could not delete product.', 500))
    }
};

  
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
