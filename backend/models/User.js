const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    role: { type: String, required: true, enum: ['user','company'] },
    companyName: { type: String, required: true },
    companyId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);