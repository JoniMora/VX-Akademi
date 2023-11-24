const express = require('express')
const { check } = require('express-validator')

const productControllers = require('../controllers/product-controllers')

const router = express.Router()

router.get('/', productControllers.getAllProducts)

router.get('/:pid', productControllers.getProductById)

router.get('/category/:cid?', productControllers.getProductsByCategory)

router.post(
    '/',
    [
      check('name').not().isEmpty(),
      check('description').isLength({ min: 5 }),
      check('price').isNumeric(),
      check('count_in_stock').isInt({ min: 0 }),
      check('quantity').isInt({ min: 0 }),
      check('category').optional().isMongoId(),
    ],
    productControllers.createProduct
)

router.patch(
    '/:pid',
    [
      check('name')
        .not()
        .isEmpty(),
      check('description').isLength({ min: 5 }),
      check('price').isNumeric(),
      check('count_in_stock').isInt({ min: 0 }),
      check('quantity').isInt({ min: 0 }),
      check('category').optional().isMongoId(),
    ],
    productControllers.updateProduct
)

router.delete('/:pid', productControllers.deleteProduct)

module.exports = router;