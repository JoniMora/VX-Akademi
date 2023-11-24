const express = require('express')
const { check } = require('express-validator')

const orderControllers = require('../controllers/order-controllers')

const router = express.Router()

router.get('/', orderControllers.getAllOrders)

router.get('/:oid', orderControllers.getOrderDetails)

router.post('/', orderControllers.createOrder)

router.post('/:oid', orderControllers.addProductCart)

router.patch('/:oid', orderControllers.updateProductCart)

router.delete('/:oid', orderControllers.deleteOrder)

router.delete('/:oid/:pid', orderControllers.deleteProductCart)

module.exports = router