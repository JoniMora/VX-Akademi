const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const { Order, OrderItem } = require('../models/order');
const HttpError = require('../models/http-error');
const Product = require('../models/product');

//const error = new HttpError('Could not find product for this id.', 404);
//    return next(error);

const createOrder = async (req, res) => {
  try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        

        const data = req.body;
        const orderItemsData = data.orderItem;

        let totalPrice = 0;
        const orderItems = [];

        for (const item of orderItemsData) {
            const product = await Product.findById(item.productID);
      
            if (!product) {
                const error = new HttpError('Could not find product for this id.', 404)
                return next(error)
            }
      
            const quantity = item.quantity;
            const unitPrice = product.price;
            
            const subtotal = unitPrice * quantity;
            totalPrice += subtotal;

            const orderItem = new OrderItem({
                product: product._id,
                quantity,
                price: unitPrice,
            });
        
            orderItems.push(orderItem);
        }

        if (totalPrice === undefined) {
            return res.status(400).json({ error: 'No se pudo calcular el total' });
        }

        if (isNaN(totalPrice)) {
            return res.status(400).json({ error: 'No se pudo calcular el total' });
          }
            
        const order = new Order({
            total: totalPrice,
            items: orderItems,
        });

        console.log('Valor de totalPrice:', totalPrice);
          
        await order.save();
          
        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la orden' });
    }
}

const addProductCart = async (req, res) => {
    try {
        const productData = req.body;
        const orderID = req.params.oid;

        let order = await Order.findOne({ _id: orderID });

        if (!order) {
            return res.status(404).json({ error: 'La orden no existe' });
        }

        const { productID, quantity } = productData;

        if (!productID || !quantity || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ error: 'Datos de producto no válidos' });
        }

        const product = await Product.findById(productID);

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const unitPrice = product.price;
        const subtotal = unitPrice * quantity;

        let totalPrice = order.total || 0; // Inicializar totalPrice con el valor existente o 0

        const existingItem = order.items.find((item) => item.product.toString() === productID);

        if (existingItem) {
            // Si el producto ya existe en la orden, actualiza la cantidad o realiza las acciones necesarias
            existingItem.quantity += quantity;
        } else {
            const orderItem = new OrderItem({
                product: product._id,
                quantity,
                price: unitPrice,
            });

            order.items.push(orderItem);
        }

        totalPrice += subtotal;
        order.total = totalPrice;

        await order.save();

        res.status(200).json({ message: 'Producto agregado a la orden con éxito', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el producto a la orden' });
    }
};


const updateProductCart = async (req, res) => {
    try {
        const productData = req.body;
        const orderID = req.params.oid;

        let order = await Order.findOne({ _id: orderID });

        if (!order) {
            return res.status(404).json({ error: 'La orden no existe' });
        }

        const { productID, quantity } = productData;

        if (!productID || isNaN(quantity) || quantity < 0) {
            return res.status(400).json({ error: 'Datos de producto no válidos' });
        }

        const product = await Product.findById(productID);

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const unitPrice = product.price;

        // Find the existing item in the order
        const existingItem = order.items.find((item) => item.product.toString() === productID);

        if (existingItem) {
            if (quantity === 0) {
                // If quantity is set to 0, remove the product from the order
                order.items = order.items.filter((item) => item.product.toString() !== productID);
            } else {
                // If the product exists in the order, update the quantity
                existingItem.quantity = quantity;
            }
        } else {
            if (quantity > 0) {
                // If the product does not exist in the order and quantity is greater than 0, add it as a new item
                const orderItem = new OrderItem({
                    product: product._id,
                    quantity,
                    price: unitPrice,
                });

                order.items.push(orderItem);
            }
        }

        // Recalculate the total price
        order.total = order.items.reduce((total, item) => total + item.price * item.quantity, 0);

        await order.save();

        res.status(200).json({ message: 'Product quantity updated in the order', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating the order' });
    }
};


const deleteOrder = async (req, res) => {
    try {
      const orderID = req.params.oid;
  
      // Use the deleteOne method to remove the order
      const result = await Order.deleteOne({ _id: orderID });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting the order' });
    }
  };

const deleteProductCart = async (req, res) => {
    const orderID = req.params.oid;
    const productID = req.params.pid;
  
    try {
      // Find the order by ID
      const order = await Order.findById(orderID);
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // Find the index of the order item to remove in the 'items' array
      const orderItemIndex = order.items.findIndex((item) => item.product.toString() === productID);
  
      if (orderItemIndex === -1) {
        return res.status(404).json({ error: 'Product not found in the order' });
      }
  
      // Remove the order item from the 'items' array
      order.items.splice(orderItemIndex, 1);
  
      // Recalculate the total price
      order.total = order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  
      // Save the updated order
      await order.save();
  
      res.status(200).json({ message: 'Product removed from the order', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error removing the product from the order' });
    }
  };
  

exports.createOrder = createOrder
exports.addProductCart = addProductCart
exports.updateProductCart = updateProductCart
exports.deleteOrder = deleteOrder
exports.deleteProductCart = deleteProductCart


