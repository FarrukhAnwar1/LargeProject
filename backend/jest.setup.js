// jest.setup.js
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';
import Car from './models/car.js';
import Rental from './models/rental.js';

dotenv.config({ path: '.env.test' });
jest.setTimeout(10000);

// Runs ONCE before each test file
beforeAll(async () => {
    const uri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(uri);
});

// Runs ONCE after each test file
afterAll(async () => {
    await User.deleteMany({});
    await Car.deleteMany({});
    await Rental.deleteMany({});
    await mongoose.connection.close();
});

// Runs before each individual test
beforeEach(async () => {
    await User.deleteMany({});
    await Car.deleteMany({});
    await Rental.deleteMany({});
});