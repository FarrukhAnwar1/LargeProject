import mongoose from "mongoose";
//const mongoose = require("mongoose");
// Define the User schema
const userSchema = new mongoose.Schema({
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
    // User type (solo, company member, company admin)
    userType: {
        type: String,
        enum: ['solo', 'company_member', 'company_admin'],
        required: true
    },

    // Company related fields
    companyName: {
        type: String,
        trim: true,
        default: function() {
            return this.userType === 'solo' ? 'N/A' : null;
        },
        validate: {
            validator: function(v) {
                if (this.userType === 'solo') return v === 'N/A'; // Must be N/A for solo users
                return v != null && v.trim().length > 0; // Require non-empty string for company users
            },
            message: 'Company name is required for company members and admins'
        }
    },

    // Email verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    // Company admin verification (for company members)
    isAdminVerified: {
        type: Boolean,
        default: function() {
            return this.userType !== 'company_member'; // true for solo and admin users
        }
    },

    // Roles assigned to the user
    role: {
        type: [String],
        enum: ['user', 'admin', 'superadmin'],
        default: ['user']
    },

    // Password reset token and its expiration
    // Verification: {
    //     token: String,
    //     expires: Date,
    //     consumedAt: Date,
    // },



    // Email verification tokens
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    
    // Admin verification tokens (for company members)
    adminVerificationToken: String,
    adminVerificationTokenExpiresAt: Date,
    
    //Reset Password tokens
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
}, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);
const User = mongoose.model("User", userSchema);
export default User;