const express = require('express');
const { check } = require('express-validator');

const categoryControllers = require('../controllers/category-controllers');

const router = express.Router();

router.get('/', categoryControllers.getAllCategory);

router.get('/:cid', categoryControllers.getCategoryById);

router.post(
    '/',
    [
      check('name').not().isEmpty()
    ],
    categoryControllers.createCategory
);

router.patch(
    '/:cid',
    [
      check('name').not().isEmpty()
    ],
    categoryControllers.updateCategory
);

router.delete('/:cid', categoryControllers.deleteCategory);

module.exports = router;