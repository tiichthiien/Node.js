const mongoose = require('mongoose');
const Product = require('./Product');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    products: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        unitPrice: Number
    }],
    totalAmount: Number,
    amountGiven: Number,
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    salesperson: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
});

transactionSchema.pre('save', async function(next) {
    for (const item of this.products) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { quantity: -item.quantity }
        });
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
