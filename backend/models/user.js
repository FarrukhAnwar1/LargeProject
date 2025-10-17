const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        trim: true,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true,
    },
    // Roles assigned to the user
    role: {
        type: [String],
        enum: ['user', 'admin', 'superadmin'],
        default: ['user'],
    },

    // Password reset token and its expiration
    Verification: {
        token: String,
        expires: Date,
        consumedAt: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);