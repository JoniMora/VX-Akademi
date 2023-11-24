const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
})

const orderSchema = new Schema({
    total: { type: Number, required: true },
    items: [orderItemSchema],
})

module.exports = {
    Order: mongoose.model('Order', orderSchema),
    OrderItem: mongoose.model('OrderItem', orderItemSchema),
}
