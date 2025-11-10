// __tests__/integration/full-workflow.test.js
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../../src/routes/auth-route.js';
import carRoutes from '../../src/routes/carRoutes.js';
import rentalRoutes from '../../src/routes/rentalRoutes.js';
import cookieParser from 'cookie-parser';
import User from '../../models/user.js';
import Car from '../../models/car.js';
import Rental from '../../models/rental.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/car', carRoutes);
app.use('/api/rental', rentalRoutes);

describe('Full Application Workflow', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/test');
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Car.deleteMany({});
        await Rental.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should complete full rental workflow', async () => {
        // 1. Sign up
        const signupRes = await request(app)
            .post('/api/auth/signup')
            .send({
                email: 'workflow@test.com',
                firstName: 'Workflow',
                lastName: 'Test',
                password: 'password123',
                userType: 'solo'
            });

        expect(signupRes.status).toBe(201);
        const token = signupRes.headers['set-cookie']
            .find(cookie => cookie.startsWith('token='))
            .split(';')[0]
            .split('=')[1];

        // 2. Add a car
        const carRes = await request(app)
            .post('/api/car/add')
            .set('Cookie', [`token=${token}`])
            .send({
                licensePlate: 'WORKFLOW1',
                year: 2020,
                color: 'Blue',
                make: 'Toyota',
                model: 'Camry',
                vehicleIdentificationNumber: 'WORKFLOW_VIN_123'
            });

        expect(carRes.status).toBe(201);
        const carId = carRes.body.car._id;

        // 3. Create a rental
        const rentalRes = await request(app)
            .post('/api/rental/')
            .set('Cookie', [`token=${token}`])
            .send({
                carID: carId,
                renterName: 'Test Renter',
                renterEmail: 'renter@test.com',
                dateRentedOut: new Date(),
                expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                rentalRatePerDay: 50
            });

        expect(rentalRes.status).toBe(201);
        expect(rentalRes.body.car.rentalStatus).toBe('rented');

        // 4. Get car rentals
        const rentalsRes = await request(app)
            .get(`/api/rental/${carId}`)
            .set('Cookie', [`token=${token}`]);

        expect(rentalsRes.status).toBe(200);
        expect(rentalsRes.body.rentals).toHaveLength(1);

        // 5. Update rental
        const rentalId = rentalRes.body.rental._id;
        const updateRes = await request(app)
            .put(`/api/rental/${rentalId}`)
            .set('Cookie', [`token=${token}`])
            .send({ actualReturnDate: new Date() });

        expect(updateRes.status).toBe(200);

        // 6. Delete rental
        const deleteRentalRes = await request(app)
            .delete(`/api/rental/${rentalId}`)
            .set('Cookie', [`token=${token}`]);

        expect(deleteRentalRes.status).toBe(200);

        // 7. Delete car
        const deleteCarRes = await request(app)
            .delete(`/api/car/${carId}`)
            .set('Cookie', [`token=${token}`]);

        expect(deleteCarRes.status).toBe(200);

        // 8. Logout
        const logoutRes = await request(app)
            .post('/api/auth/logout');

        expect(logoutRes.status).toBe(200);
    });
});