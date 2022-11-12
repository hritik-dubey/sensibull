const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    identifier: {
        type: String, required: true, trim: true, unique:true
    },
    symbol: {
        type: String, required: true, trim: true
    },
    quantity: {
        type: String, required: true, trim: true,
    },
    filled_quantity: {
        type: String, required: true, trim: true,
    },
    order_status: {
        type: String, required: true, trim: true,
    }
}, { timestamps: true })

module.exports = mongoose.model('order', orderSchema);