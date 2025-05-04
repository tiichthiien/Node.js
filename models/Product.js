const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    importPrice: { type: Number, required: true },
    retailPrice: { type: Number, required: true },
    category: String,
    creationDate: { type: Date, default: Date.now },
    image : {type: String, required: true},
    quantity: {type: Number}
});

module.exports = mongoose.model('Product', productSchema);
