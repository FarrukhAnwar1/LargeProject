// __tests__/setup/testHelpers.js
import User from '../../models/user.js';
import Car from '../../models/car.js';
import Rental from '../../models/rental.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createTestUser = async (userData = {}) => {
  const defaultData = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: await bcrypt.hash('password123', 10),
    userType: 'solo',
    isEmailVerified: true,
    isAdminVerified: true
  };

  return await User.create({ ...defaultData, ...userData });
};

export const createTestCar = async (carData = {}) => {
  const defaultData = {
    licensePlate: 'TEST123',
    year: 2020,
    color: 'Blue',
    make: 'Toyota',
    model: 'Camry',
    vehicleIdentificationNumber: `VIN${Date.now()}`,
    companyName: 'N/A'
  };

  return await Car.create({ ...defaultData, ...carData });
};

export const createTestRental = async (rentalData = {}) => {
  const defaultData = {
    renterName: 'John Doe',
    renterEmail: 'renter@example.com',
    dateRentedOut: new Date('2024-01-01'),
    expectedReturnDate: new Date('2024-01-10'),
    rentalRatePerDay: 50
  };

  return await Rental.create({ ...defaultData, ...rentalData });
};

export const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
};

export const cleanDatabase = async () => {
  await User.deleteMany({});
  await Car.deleteMany({});
  await Rental.deleteMany({});
};