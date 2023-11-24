const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    count_in_stock: { type: Number, required: true },
    image: { type: String, required: false },
    quantity: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Category' }
})

module.exports = mongoose.model('product', productSchema)