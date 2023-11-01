const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Category = require('../models/category')
const HttpError = require('../models/http-error');

const getAllCategory = async (req, res, next) => {
    let categories;
    try {
        categories = await Category.find(); 

        res.status(200).json({ categories: categories });
    } catch (err) {
        const error = new HttpError('Could not retrieve categories.', 500);
        return next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    const categoryID = req.params.cid;
  
    let category;
    try {
        category = await Category.findById(categoryID);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update category.', 500);
        return next(error);
    }
  
    if (!category) {
        const error = new HttpError('Could not find category for this id.', 404);
        return next(error);
    }
  
    res.json({ category: category.toObject({ getters: true }) });
};

const createCategory = async (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
  
    const { name } = req.body;

    const newCategory = new Category({
        name
    });

    let session
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        await newCategory.save({ session });
        
        await session.commitTransaction();
    } catch (err) {
        if (session) {
            session.abortTransaction();
        }
        return next(new HttpError('Creating category failed, please try again.', 500));
    } finally {
        if (session) {
            session.endSession();
        }
    }

    res.status(201).json({ category: newCategory.toObject({ getters: true }) });
};

const updateCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
  
    const { name } = req.body;
    const categoryID = req.params.cid;
  
    let category;
    try {
        category = await Category.findById(categoryID);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update category.', 500);
        return next(error);
    }
  
    category.name = name;
  
    try {
        await category.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update category.', 500);
        return next(error);
    }
  
    res.status(200).json({ category: category.toObject({ getters: true }) });
};
  
const deleteCategory = async (req, res, next) => {
    const categoryID = req.params.cid;
  
    let category;
    try {
        category = await Category.findByIdAndDelete(categoryID);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete category.', 500);
        return next(error);
    }
  
    if (!category) {
        const error = new HttpError('Could not find category for this id.', 404);
        return next(error);
    }

    let session
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        await category.remove({ session });

        await session.commitTransaction();
    } catch (err) {
        if (session) {
            session.abortTransaction();
        }
        const error = new HttpError('Something went wrong, could not delete category.', 500);
        return next(error);
    }finally {
        if (session) {
            session.endSession();
        }
    }
  
    res.status(200).json({ message: 'Deleted category.' });
};

exports.getAllCategory = getAllCategory;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;