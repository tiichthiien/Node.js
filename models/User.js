const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true },
    role: { type: String, enum: ['admin', 'salesperson'], default: 'salesperson' },
    profilePicture: {type: String, default: "http://localhost:8080/uploads/default_avt.jpg"},
    isActive: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    status: {type: String, enum: ['online', 'offline'], default: 'offline'},
    creationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);