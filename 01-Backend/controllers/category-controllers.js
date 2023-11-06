const mongoose = require('mongoose')
const { validationResult } = require('express-validator')

const Category = require('../models/category')
const HttpError = require('../models/http-error')

const getAllCategory = async (req, res, next) => {
    try {
        const categories = await Category.find()

        res.status(200).json({ categories: categories })
    } catch (err) {
        return next(new HttpError('Could not retrieve categories.', 500))
    }
}

const getCategoryById = async (req, res, next) => {
    const categoryID = req.params.cid
    try {
        const category = await Category.findById(categoryID)
        if (!category) {
            return next(new HttpError('Could not find category for this id.', 404))
        }
      
        res.json({ category: category.toObject({ getters: true }) })
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update category.', 500))
    }
  
}

const createCategory = async (req, res, next) => {
    const errors = validationResult(req)
  
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const { name } = req.body
    const newCategory = new Category({
        name
    })

    let session
    try {
        const session = await mongoose.startSession()
        session.startTransaction()
    
        await newCategory.save({ session })
        
        await session.commitTransaction()
        session.endSession()
        res.status(201).json({ category: newCategory.toObject({ getters: true }) })
    } catch (err) {
        return next(new HttpError('Creating category failed, please try again.', 500))
    } 
}

const updateCategory = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422))
    }
  
    const { name } = req.body
    const categoryID = req.params.cid

    try {
        const category = await Category.findById(categoryID)
        if (!category) {
            return next(new HttpError('Could not find category for this id.', 404))
        }
        category.name = name

        await category.save()
        res.status(200).json({ category: category.toObject({ getters: true }) })
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update category.', 500))
    }
}
  
const deleteCategory = async (req, res, next) => {
    const categoryID = req.params.cid
    try {
        const result = await Category.findByIdAndDelete(categoryID)
        if (!result) {
            return next(new HttpError('Could not find category for this id.', 404))
        }

        res.status(200).json({ message: 'Deleted category.' })
    } catch (err) {
        return next(new HttpError('Something went wrong, could not delete category.', 500))
    }
}
exports.getAllCategory = getAllCategory
exports.getCategoryById = getCategoryById
exports.createCategory = createCategory
exports.updateCategory = updateCategory
exports.deleteCategory = deleteCategory