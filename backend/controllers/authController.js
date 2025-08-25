const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password, employeeId } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

        if (user.employeeId !== employeeId) return res.status(400).json({ message: "Invalid Employee Id" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            message: "Login successful", 
            token,
            user: {
                employeeName: user.employeeName,
                email: user.email,
                role: user.role,
                companyName: user.companyName
            }
        });
        
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.logout = (req, res) => {
    // For JWT, just remove token on frontend or blacklist it on backend
    res.json({ message: "Logout successful" });
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
