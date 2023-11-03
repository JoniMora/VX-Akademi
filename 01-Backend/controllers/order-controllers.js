const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const { Order, OrderItem } = require('../models/order');
const HttpError = require('../models/http-error');
const Product = require('../models/product');

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
                return res.status(404).json({ error: 'Producto no encontrado' });
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





exports.createOrder = createOrder;
exports.addProductCart = addProductCart; 

