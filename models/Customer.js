const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    address: String,
    purchaseHistory: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }]
});

module.exports = mongoose.model('Customer', customerSchema);