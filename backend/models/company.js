const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyId: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('Company', companySchema);


