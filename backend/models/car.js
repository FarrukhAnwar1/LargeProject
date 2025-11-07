import mongoose from "mongoose";

// Define the Car schema
const carSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    companyName: {
        type:String,
        default: "N/A"
    },
    // Unique license plate number
    licensePlate: {
        type: String,
        required: true,
        trim: true
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
    vehicleIdentificationNumber: {
        type: String,
        required: true,
        trim: true
    },
    carType: {
        type: String,
        enum: ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'van', 'motorcycle', 'other'],
        default: 'sedan',
    }
}, { timestamps: true });

const Car = mongoose.model ('Car', carSchema);
export default Car;