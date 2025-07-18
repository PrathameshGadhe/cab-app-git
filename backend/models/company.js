const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
    // Aap chahe toh companyName, companyId bhi rakh sakte hain, lekin login ke liye zaroori nahi
});

module.exports = mongoose.model('Company', companySchema);