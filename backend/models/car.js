const mongoose = require('mongoose');

// Define the Car schema
const carSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    // Unique license plate number
    licensePlate: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    // Rental status
    rentalStatus: {
        type: String,
        enum: ['available', 'rented', 'maintenance'],
        default: 'available',
    },
    // Information about the current renter
    currentRental: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rental',
    },
    // Car details
    year: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    make: {
        type: String,
        required: true,
        trim: true,
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    mileage: {
        type: Number,
        default: 0,
    },
    // Maintenance and condition
    repairStatus: {
        type: String,
        default: 'ok',
    },
    warningLightIndicators: [{
        type: String,
    }],
    registrationNumber: {
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);