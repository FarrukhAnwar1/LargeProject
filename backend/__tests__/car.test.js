import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import carRoutes from '../src/routes/carRoutes.js';
import Car from '../models/car.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { jest } from '@jest/globals';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/car', carRoutes);

describe('Car Routes', () => {
    let soloUser, companyAdmin, companyMember, authToken, adminToken, memberToken;

    beforeEach(async () => {
        await User.deleteMany({});
        await Car.deleteMany({});

        // Create test users
        soloUser = await User.create({
            email: 'solo@example.com',
            firstName: 'Solo',
            lastName: 'User',
            passwordHash: 'hashedpassword',
            userType: 'solo',
            isEmailVerified: true,
            isAdminVerified: true
        });

        companyAdmin = await User.create({
            email: 'admin@company.com',
            firstName: 'Admin',
            lastName: 'User',
            passwordHash: 'hashedpassword',
            userType: 'company_admin',
            companyName: 'Test Company',
            isEmailVerified: true,
            isAdminVerified: true
        });

        companyMember = await User.create({
            email: 'member@company.com',
            firstName: 'Member',
            lastName: 'User',
            passwordHash: 'hashedpassword',
            userType: 'company_member',
            companyName: 'Test Company',
            isEmailVerified: true,
            isAdminVerified: true
        });

        // Generate tokens
        authToken = jwt.sign({ userId: soloUser._id }, process.env.JWT_SECRET || 'test-secret');
        adminToken = jwt.sign({ userId: companyAdmin._id }, process.env.JWT_SECRET || 'test-secret');
        memberToken = jwt.sign({ userId: companyMember._id }, process.env.JWT_SECRET || 'test-secret');
    });

    describe('GET /api/car/companies', () => {
        it('should return list of companies', async () => {
            const res = await request(app).get('/api/car/companies');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toContain('Test Company');
        });

        it('should not include N/A or solo users', async () => {
            const res = await request(app).get('/api/car/companies');

            expect(res.body).not.toContain('N/A');
        });

        it('should return empty array when no companies exist', async () => {
            await User.deleteMany({});
            const res = await request(app).get('/api/car/companies');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should not return duplicate company names', async () => {
            // Create another admin for same company (shouldn't happen, but testing)
            await User.create({
                email: 'admin2@company.com',
                firstName: 'Admin2',
                lastName: 'User2',
                passwordHash: 'hashedpassword',
                userType: 'company_admin',
                companyName: 'Test Company',
                isEmailVerified: true,
                isAdminVerified: true
            });

            const res = await request(app).get('/api/car/companies');
            const testCompanyCount = res.body.filter(c => c === 'Test Company').length;

            expect(testCompanyCount).toBe(1);
        });
    });

    describe('POST /api/car/add', () => {
        const carData = {
            licensePlate: 'ABC123',
            year: 2020,
            color: 'Blue',
            make: 'Toyota',
            model: 'Camry',
            vehicleIdentificationNumber: 'VIN123456789',
            mileage: 50000,
            carType: 'sedan'
        };

        it('should add car for solo user', async () => {
            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${authToken}`])
                .send(carData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.car.licensePlate).toBe('ABC123');
            expect(res.body.car.companyName).toBe('N/A');
            expect(res.body.car.userID.toString()).toBe(soloUser._id.toString());
        });

        it('should add car for company admin', async () => {
            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${adminToken}`])
                .send(carData);

            expect(res.status).toBe(201);
            expect(res.body.car.companyName).toBe('Test Company');
            expect(res.body.car.userID.toString()).toBe(companyAdmin._id.toString());
        });

        it('should add car for company member', async () => {
            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${memberToken}`])
                .send(carData);

            expect(res.status).toBe(201);
            expect(res.body.car.companyName).toBe('Test Company');
        });

        it('should reject without required fields', async () => {
            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${authToken}`])
                .send({ licensePlate: 'ABC123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('All fields are required');
        });

        it('should reject without license plate', async () => {
            const invalidData = { ...carData };
            delete invalidData.licensePlate;

            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${authToken}`])
                .send(invalidData);

            expect(res.status).toBe(400);
        });

        it('should reject without VIN', async () => {
            const invalidData = { ...carData };
            delete invalidData.vehicleIdentificationNumber;

            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${authToken}`])
                .send(invalidData);

            expect(res.status).toBe(400);
        });

        it('should reject duplicate VIN for solo user', async () => {
            await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${authToken}`])
                .send(carData);

            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${authToken}`])
                .send(carData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('You already have a car with this VIN');
        });

        it('should reject duplicate VIN within company', async () => {
            await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${adminToken}`])
                .send(carData);

            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${memberToken}`])
                .send(carData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('A car with this VIN already exists in your company');
        });

        it('should allow same VIN for different users/companies', async () => {
            await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${authToken}`])
                .send(carData);

            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${adminToken}`])
                .send(carData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should set default values for optional fields', async () => {
            const minimalData = {
                licensePlate: 'MIN123',
                year: 2021,
                color: 'Red',
                make: 'Honda',
                model: 'Civic',
                vehicleIdentificationNumber: 'MINVIN123'
            };

            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', [`token=${authToken}`])
                .send(minimalData);

            expect(res.status).toBe(201);
            expect(res.body.car.mileage).toBe(0);
            expect(res.body.car.carType).toBe('sedan');
            expect(res.body.car.rentalStatus).toBe('available');
        });

        it('should reject without authentication', async () => {
            const res = await request(app)
                .post('/api/car/add')
                .send(carData);

            expect(res.status).toBe(401);
        });

        it('should reject with invalid token', async () => {
            // 1. Mute console.error before the test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            const res = await request(app)
                .post('/api/car/add')
                .set('Cookie', ['token=invalid-token'])
                .send(carData);

            expect(res.status).toBe(401);

            // 2. Restore console.error after the test
            consoleErrorSpy.mockRestore();
        });
    });

    describe('GET /api/car/', () => {
        beforeEach(async () => {
            // Add cars for different users
            await Car.create({
                userID: soloUser._id,
                companyName: 'N/A',
                licensePlate: 'SOLO1',
                year: 2020,
                color: 'Blue',
                make: 'Toyota',
                model: 'Camry',
                vehicleIdentificationNumber: 'VIN1'
            });

            await Car.create({
                userID: companyAdmin._id,
                companyName: 'Test Company',
                licensePlate: 'COMP1',
                year: 2021,
                color: 'Red',
                make: 'Honda',
                model: 'Accord',
                vehicleIdentificationNumber: 'VIN2'
            });

            await Car.create({
                userID: companyMember._id,
                companyName: 'Test Company',
                licensePlate: 'COMP2',
                year: 2022,
                color: 'Black',
                make: 'Ford',
                model: 'F150',
                vehicleIdentificationNumber: 'VIN3',
                carType: 'truck'
            });
        });

        it('should return only solo user cars', async () => {
            const res = await request(app)
                .get('/api/car/')
                .set('Cookie', [`token=${authToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.cars).toHaveLength(1);
            expect(res.body.cars[0].licensePlate).toBe('SOLO1');
        });

        it('should return all company cars for admin', async () => {
            const res = await request(app)
                .get('/api/car/')
                .set('Cookie', [`token=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.cars).toHaveLength(2);
            expect(res.body.cars.every(car => car.companyName === 'Test Company')).toBe(true);
        });

        it('should return all company cars for member', async () => {
            const res = await request(app)
                .get('/api/car/')
                .set('Cookie', [`token=${memberToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.cars).toHaveLength(2);
        });

        it('should filter by car type', async () => {
            const res = await request(app)
                .get('/api/car/?carType=truck')
                .set('Cookie', [`token=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.cars).toHaveLength(1);
            expect(res.body.cars[0].carType).toBe('truck');
        });

        it('should filter by make', async () => {
            const res = await request(app)
                .get('/api/car/?make=Honda')
                .set('Cookie', [`token=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.cars).toHaveLength(1);
            expect(res.body.cars[0].make).toBe('Honda');
        });

        it('should filter by model', async () => {
            const res = await request(app)
                .get('/api/car/?model=Accord')
                .set('Cookie', [`token=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.cars).toHaveLength(1);
            expect(res.body.cars[0].model).toBe('Accord');
        });

        it('should filter by year', async () => {
            const res = await request(app)
                .get('/api/car/?year=2021')
                .set('Cookie', [`token=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.cars).toHaveLength(1);
            expect(res.body.cars[0].year).toBe(2021);
        });

        it('should filter by rental status', async () => {
            await Car.create({
                userID: companyAdmin._id,
                companyName: 'Test Company',
                licensePlate: 'RENTED1',
                year: 2023,
                color: 'White',
                make: 'Tesla',
                model: 'Model 3',
                vehicleIdentificationNumber: 'VIN_RENTED',
                rentalStatus: 'rented'
            });

            const res = await request(app)
                .get('/api/car/?rentalStatus=rented')
                .set('Cookie', [`token=${adminToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.cars).toHaveLength(1);
            expect(res.body.cars[0].rentalStatus).toBe('rented');
        });

        it('should return empty array when no cars match filters', async () => {
            const res = await request(app)
                .get('/api/car/?make=NonExistent')
                .set('Cookie', [`token=${authToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.cars).toHaveLength(0);
        });

        it('should reject without authentication', async () => {
            const res = await request(app).get('/api/car/');

            expect(res.status).toBe(401);
        });
    });

    describe('PATCH /api/car/:id', () => {
        let soloCar, companyCar;

        beforeEach(async () => {
            soloCar = await Car.create({
                userID: soloUser._id,
                companyName: 'N/A',
                licensePlate: 'SOLO1',
                year: 2020,
                color: 'Blue',
                make: 'Toyota',
                model: 'Camry',
                vehicleIdentificationNumber: 'VIN1'
            });

            companyCar = await Car.create({
                userID: companyAdmin._id,
                companyName: 'Test Company',
                licensePlate: 'COMP1',
                year: 2021,
                color: 'Red',
                make: 'Honda',
                model: 'Accord',
                vehicleIdentificationNumber: 'VIN2'
            });
        });

        it('should update car for owner', async () => {
            const res = await request(app)
                .patch(`/api/car/${soloCar._id}`)
                .set('Cookie', [`token=${authToken}`])
                .send({ color: 'Green', mileage: 60000 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.car.color).toBe('Green');
            expect(res.body.car.mileage).toBe(60000);
        });

        it('should allow company member to edit company car', async () => {
            const res = await request(app)
                .patch(`/api/car/${companyCar._id}`)
                .set('Cookie', [`token=${memberToken}`])
                .send({ color: 'Yellow' });

            expect(res.status).toBe(200);
            expect(res.body.car.color).toBe('Yellow');
        });

        it('should update multiple fields', async () => {
            const updates = {
                color: 'Silver',
                mileage: 75000,
                repairStatus: 'needs attention',
                rentalStatus: 'maintenance'
            };

            const res = await request(app)
                .patch(`/api/car/${soloCar._id}`)
                .set('Cookie', [`token=${authToken}`])
                .send(updates);

            expect(res.status).toBe(200);
            expect(res.body.car.color).toBe('Silver');
            expect(res.body.car.mileage).toBe(75000);
            expect(res.body.car.repairStatus).toBe('needs attention');
            expect(res.body.car.rentalStatus).toBe('maintenance');
        });

        it('should update warning light indicators', async () => {
            const res = await request(app)
                .patch(`/api/car/${soloCar._id}`)
                .set('Cookie', [`token=${authToken}`])
                .send({ warningLightIndicators: ['check engine', 'low oil'] });

            expect(res.status).toBe(200);
            expect(res.body.car.warningLightIndicators).toEqual(['check engine', 'low oil']);
        });

        it('should reject editing another users car', async () => {
            const res = await request(app)
                .patch(`/api/car/${companyCar._id}`)
                .set('Cookie', [`token=${authToken}`])
                .send({ color: 'Green' });

            expect(res.status).toBe(403);
            expect(res.body.message).toContain('Access Denied');
        });

        it('should reject duplicate VIN within scope', async () => {
            const anotherCar = await Car.create({
                userID: soloUser._id,
                companyName: 'N/A',
                licensePlate: 'SOLO2',
                year: 2019,
                color: 'White',
                make: 'Ford',
                model: 'Focus',
                vehicleIdentificationNumber: 'VIN_UNIQUE'
            });

            const res = await request(app)
                .patch(`/api/car/${anotherCar._id}`)
                .set('Cookie', [`token=${authToken}`])
                .send({ vehicleIdentificationNumber: 'VIN1' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('You already have a car with this VIN');
        });

        it('should reject duplicate license plate', async () => {
            const anotherCar = await Car.create({
                userID: soloUser._id,
                companyName: 'N/A',
                licensePlate: 'UNIQUE1',
                year: 2019,
                color: 'White',
                make: 'Ford',
                model: 'Focus',
                vehicleIdentificationNumber: 'VIN_UNIQUE2'
            });

            const res = await request(app)
                .patch(`/api/car/${anotherCar._id}`)
                .set('Cookie', [`token=${authToken}`])
                .send({ licensePlate: 'SOLO1' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('A car with this license plate already exists');
        });

        it('should allow updating to same VIN (no change)', async () => {
            const res = await request(app)
                .patch(`/api/car/${soloCar._id}`)
                .set('Cookie', [`token=${authToken}`])
                .send({
                    vehicleIdentificationNumber: 'VIN1',
                    color: 'Purple'
                });

            expect(res.status).toBe(200);
            expect(res.body.car.color).toBe('Purple');
        });

        it('should reject non-existent car', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/car/${fakeId}`)
                .set('Cookie', [`token=${authToken}`])
                .send({ color: 'Green' });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Car not found');
        });

        it('should reject invalid car ID format', async () => {
            // 1. Mute console.error before the test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            const res = await request(app)
                .patch('/api/car/invalid-id')
                .set('Cookie', [`token=${authToken}`])
                .send({ color: 'Green' });

            expect(res.status).toBe(400);

            // 2. Restore console.error after the test
            consoleErrorSpy.mockRestore();
        });
    });

    describe('DELETE /api/car/:id', () => {
        let soloCar, companyCar;

        beforeEach(async () => {
            soloCar = await Car.create({
                userID: soloUser._id,
                companyName: 'N/A',
                licensePlate: 'SOLO1',
                year: 2020,
                color: 'Blue',
                make: 'Toyota',
                model: 'Camry',
                vehicleIdentificationNumber: 'VIN1'
            });

            companyCar = await Car.create({
                userID: companyAdmin._id,
                companyName: 'Test Company',
                licensePlate: 'COMP1',
                year: 2021,
                color: 'Red',
                make: 'Honda',
                model: 'Accord',
                vehicleIdentificationNumber: 'VIN2'
            });
        });

        it('should delete own car', async () => {
            const res = await request(app)
                .delete(`/api/car/${soloCar._id}`)
                .set('Cookie', [`token=${authToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Car successfully deleted');

            const car = await Car.findById(soloCar._id);
            expect(car).toBeNull();
        });

        it('should allow company member to delete company car', async () => {
            const res = await request(app)
                .delete(`/api/car/${companyCar._id}`)
                .set('Cookie', [`token=${memberToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should allow company admin to delete company car', async () => {
            const memberCar = await Car.create({
                userID: companyMember._id,
                companyName: 'Test Company',
                licensePlate: 'MEMBER1',
                year: 2022,
                color: 'Black',
                make: 'Ford',
                model: 'F150',
                vehicleIdentificationNumber: 'VIN_MEMBER'
            });

            const res = await request(app)
                .delete(`/api/car/${memberCar._id}`)
                .set('Cookie', [`token=${adminToken}`]);

            expect(res.status).toBe(200);
        });

        it('should reject deleting another users car', async () => {
            const res = await request(app)
                .delete(`/api/car/${companyCar._id}`)
                .set('Cookie', [`token=${authToken}`]);

            expect(res.status).toBe(403);
            expect(res.body.message).toContain('Access Denied');
        });

        it('should reject non-existent car', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/car/${fakeId}`)
                .set('Cookie', [`token=${authToken}`]);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Car was not found');
        });

        it('should reject without car ID', async () => {
            const res = await request(app)
                .delete('/api/car/')
                .set('Cookie', [`token=${authToken}`]);

            expect(res.status).toBe(404);
        });

        it('should reject without authentication', async () => {
            const res = await request(app)
                .delete(`/api/car/${soloCar._id}`);

            expect(res.status).toBe(401);
        });
    });
});