const { validationResult } = require('express-validator')
const { Order, OrderItem } = require('../models/order')
const HttpError = require('../models/http-error')
const Product = require('../models/product')

const getAllOrders = async (req, res, next) => {
    try {
      const orders = await Order.find()
      res.json(orders)
    } catch (error) {
      return next(new HttpError('Error fetching orders', 500))
    }
}

const getOrderDetails = async (req, res, next) => {
    try {
        const orderID = req.params.oid

        const order = await Order.findById(orderID).populate('items.product')
        if (!order) {
            return next(new HttpError('Could not find order for this id.', 404))
        }
        
        res.json(order)
    } catch (error) {
        console.log(error)
        return next(new HttpError('Error fetching order', 500))
    }
}


const createOrder = async (req, res) => {
  try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
    
        const data = req.body
        const orderItemsData = data.orderItem

        let totalPrice = 0
        const orderItems = []

        for (const item of orderItemsData) {
            const product = await Product.findById(item.productID)
            if (!product) {
                return next(new HttpError('Could not find product for this id.', 404))
            }
      
            const quantity = item.quantity
            const unitPrice = product.price
            
            const subtotal = unitPrice * quantity
            totalPrice += subtotal

            const orderItem = new OrderItem({
                product: product._id,
                quantity,
                price: unitPrice,
            })
        
            orderItems.push(orderItem)
        }

        if (totalPrice === undefined || isNaN(totalPrice)) {
            return next(new HttpError('Cannot calculate total', 400))
        }
            
        const order = new Order({
            total: totalPrice,
            items: orderItems,
        })
          
        await order.save()
          
        res.status(201).json(order)
    } catch (error) {
        return next(new HttpError('Error creating order', 500))
    }
}

const addProductCart = async (req, res) => {
    try {
        const productData = req.body
        const orderID = req.params.oid

        let order = await Order.findOne({ _id: orderID })
        if (!order) {
            return next(new HttpError('Could not find orden for this id.', 404))
        }

        const { productID, quantity } = productData

        if (!productID || !quantity || isNaN(quantity) || quantity < 1) {
            return next(new HttpError('Invalid product data', 400))
        }

        const product = await Product.findById(productID)
        if (!product) {
            return next(new HttpError('Could not find product for this id.', 404))
        }

        const unitPrice = product.price
        const subtotal = unitPrice * quantity

        let totalPrice = order.total || 0

        const existingItem = order.items.find((item) => item.product.toString() === productID)
        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            const orderItem = new OrderItem({
                product: product._id,
                quantity,
                price: unitPrice,
            })

            order.items.push(orderItem)
        }

        totalPrice += subtotal
        order.total = totalPrice

        await order.save()

        res.status(200).json({ message: 'Product added to order successfully', order })
    } catch (error) {
        return next(new HttpError('Error adding product to order', 500))
    }
}

const updateProductCart = async (req, res) => {
    try {
        const productData = req.body
        const orderID = req.params.oid

        let order = await Order.findOne({ _id: orderID })
        if (!order) {
            return next(new HttpError('Could not find orden for this id.', 404))
        }

        const { productID, quantity } = productData

        if (!productID || isNaN(quantity) || quantity < 0) {
            return next(new HttpError('Invalid product data', 400))
        }

        const product = await Product.findById(productID)
        if (!product) {
            return next(new HttpError('Could not find product for this id.', 404))
        }

        const unitPrice = product.price

        const existingItem = order.items.find((item) => item.product.toString() === productID)
        if (existingItem) {
            if (quantity === 0) {
                order.items = order.items.filter((item) => item.product.toString() !== productID)
            } else {
                existingItem.quantity = quantity
            }
        } else {
            if (quantity > 0) {
                const orderItem = new OrderItem({
                    product: product._id,
                    quantity,
                    price: unitPrice,
                })

                order.items.push(orderItem)
            }
        }

        order.total = order.items.reduce((total, item) => total + item.price * item.quantity, 0)

        await order.save()

        res.status(200).json({ message: 'Product quantity updated in the order', order })
    } catch (error) {
        return next(new HttpError('Error adding product to order', 500))
    }
}

const deleteOrder = async (req, res) => {
    try {
        const orderID = req.params.oid
        const order = await Order.deleteOne({ _id: orderID })
    
        if (order.deletedCount === 0) { //deletedCount mongoDB
            return next(new HttpError('Order not found', 404))
        }
    
        res.status(200).json({ message: 'Order deleted successfully' })
    } catch (error) {
        return next(new HttpError('Error deleting the order', 500))
    }
}

const deleteProductCart = async (req, res, next) => {
    const orderID = req.params.oid
    const productID = req.params.pid
  
    try {
        const order = await Order.findById(orderID)
    
        if (!order) {
            return next(new HttpError('Could not find orden for this id.', 404))
        }
    
        const orderItemIndex = order.items.findIndex((item) => item.product.toString() === productID)
        if (orderItemIndex === -1) {
            return next(new HttpError('Product not found in the order', 404))
        }
    
        order.items.splice(orderItemIndex, 1)

        order.total = order.items.reduce((total, item) => total + item.price * item.quantity, 0)
    
        await order.save()
    
        res.status(200).json({ message: 'Product removed from the order', order })
    } catch (error) {
        return next(new HttpError('Error deleting the order', 500))
    }
}
  
exports.getAllOrders = getAllOrders
exports.getOrderDetails = getOrderDetails
exports.createOrder = createOrder
exports.addProductCart = addProductCart
exports.updateProductCart = updateProductCart
exports.deleteOrder = deleteOrder
exports.deleteProductCart = deleteProductCart
