const mongoose = require('mongoose');

// Define the Car schema
const carSchema = new mongoose.Schema({
    // Unique license plate number
    licensePlate: {
        type: String,
        required: true,
        trim : true,
    },
    // Rental status
    rentalStatus: {
        type: String,
        enum: ['available', 'rented', 'maintenance'],
        default: 'available',
    },
    // Information about the current renter
    renterName: String,
    renterEmail: String,
    renterPhone: String,
    currentRental: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rental',
    },
    // Car details
    year: Number,
    color: String,
    make: String,
    model: String,
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
    registrationNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);