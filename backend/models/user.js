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
    //Company assigned to employy
    companyName: {
        type: String,
        trim: true,
        required:true,
    },

    isVerified: {
        type: Boolean,
        default: false,
        //i took away required, not sure if this messes up anything
    },

    // Roles assigned to the user
    role: {
        type: [String],
        enum: ['user', 'admin', 'superadmin'],
        default: ['user'],
    },

    // Password reset token and its expiration
    // Verification: {
    //     token: String,
    //     expires: Date,
    //     consumedAt: Date,
    // },

 

    //Adjusted verification tokens just for my use:
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    //Reset Password tokens
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
}, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);
const User = mongoose.model("User", userSchema);
export default User;