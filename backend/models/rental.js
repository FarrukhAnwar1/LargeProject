const mongoose = require('mongoose');

// Define the Rental schema
const rentalSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
        index: true,
    },
    renterName: {
        type: String,
        required: true,
        trim: true,
    },
    renterEmail: {
        type: String,
        required: true,
        trim: true,
    },
    renterPhone: {
        type: String,
        trim: true,
    },
    dateRentedOut: {
        type: Date,
        required: true,
    },
    expectedReturnDate: {
        type: Date,
        required: true,
    },
    actualReturnDate: {
        type: Date,
    },
    overdueStatus: {
        type: Boolean,
        default: false,
    },
    rentalRatePerDay: {
        type: Number,
        required: true,
        min: 0,
    },
    totalCost: {
        type: Number,
        min: 0,
    },
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

// index to quickly find rentals by car and sort by rental date
rentalSchema.index({ car: 1, dateRentedOut: -1 });

module.exports = mongoose.model('Rental', rentalSchema);