const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    quantity: { type: Number },
    totalPrice: { type: Number},
});

module.exports = mongoose.model('Order', orderSchema);