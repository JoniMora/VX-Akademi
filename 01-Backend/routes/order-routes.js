const express = require('express');
const { check } = require('express-validator');

const orderControllers = require('../controllers/order-controllers');

const router = express.Router();

router.post('/', orderControllers.createOrder);

router.post('/:oid', orderControllers.addProductCart);



module.exports = router;