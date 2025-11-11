// __tests__/rental.test.js
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import rentalRoutes from '../src/routes/rentalRoutes.js';
import Rental from '../models/rental.js';
import Car from '../models/car.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/rental', rentalRoutes);

describe('Rental Routes', () => {
  let user, authToken, car;

  beforeEach(async () => {
    await User.deleteMany({});
    await Car.deleteMany({});
    await Rental.deleteMany({});

    // Create test user
    user = await User.create({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashedpassword',
      userType: 'solo',
      isEmailVerified: true,
      isAdminVerified: true
    });

    // Create test car
    car = await Car.create({
      userID: user._id,
      companyName: 'N/A',
      licensePlate: 'TEST123',
      year: 2020,
      color: 'Blue',
      make: 'Toyota',
      model: 'Camry',
      vehicleIdentificationNumber: 'VIN123',
      rentalStatus: 'available'
    });

    authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('POST /api/rental/', () => {
    const rentalData = {
      renterName: 'John Doe',
      renterEmail: 'renter@example.com',
      renterPhone: '555-1234',
      dateRentedOut: new Date('2024-01-01'),
      expectedReturnDate: new Date('2024-01-10'),
      rentalRatePerDay: 50,
      notes: 'Test rental'
    };

    it('should create a new rental', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: car._id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.rental.renterName).toBe('John Doe');
      expect(res.body.car.rentalStatus).toBe('rented');
      expect(res.body.car.currentRental).toBeDefined();
    });

    it('should update car status to rented', async () => {
      await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: car._id });

      const updatedCar = await Car.findById(car._id);
      expect(updatedCar.rentalStatus).toBe('rented');
      expect(updatedCar.currentRental).toBeDefined();
    });

    it('should reject without carID', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send(rentalData);

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('Car ID is required');
    });

    it('should reject without renter name', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: car._id, renterName: undefined });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('Renter name is required');
    });

    it('should reject without renter email', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: car._id, renterEmail: undefined });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('Renter email is required');
    });

    it('should reject without rental dates', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({
          carID: car._id,
          renterName: 'John Doe',
          renterEmail: 'renter@example.com',
          rentalRatePerDay: 50
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('Rental start date is required');
    });

    it('should reject without expected return date', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({
          carID: car._id,
          renterName: 'John Doe',
          renterEmail: 'renter@example.com',
          dateRentedOut: new Date('2024-01-01'),
          rentalRatePerDay: 50
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('Expected return date is required');
    });

    it('should reject without rental rate', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({
          carID: car._id,
          renterName: 'John Doe',
          renterEmail: 'renter@example.com',
          dateRentedOut: new Date('2024-01-01'),
          expectedReturnDate: new Date('2024-01-10')
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('Rental rate per day is required');
    });

    it('should reject negative rental rate', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: car._id, rentalRatePerDay: -10 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('Rental rate per day cannot be negative');
    });

    it('should accept zero rental rate', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: car._id, rentalRatePerDay: 0 });

      expect(res.status).toBe(201);
      expect(res.body.rental.rentalRatePerDay).toBe(0);
    });

    it('should reject for non-existent car', async () => {
      const fakeCarId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: fakeCarId });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Car not found');
    });

    it('should create rental without optional fields', async () => {
      const minimalData = {
        carID: car._id,
        renterName: 'Jane Doe',
        renterEmail: 'jane@example.com',
        dateRentedOut: new Date('2024-02-01'),
        expectedReturnDate: new Date('2024-02-05'),
        rentalRatePerDay: 60
      };

      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send(minimalData);

      expect(res.status).toBe(201);
      expect(res.body.rental.renterPhone).toBe('');
      expect(res.body.rental.notes).toBe('');
    });

    it('should set totalCost to 0 initially', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: car._id });

      expect(res.status).toBe(201);
      expect(res.body.rental.totalCost).toBe(0);
    });

    it('should set overdueStatus to false by default', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .set('Cookie', [`token=${authToken}`])
        .send({ ...rentalData, carID: car._id });

      expect(res.status).toBe(201);
      expect(res.body.rental.overdueStatus).toBe(false);
    });

    it('should reject without authentication', async () => {
      const res = await request(app)
        .post('/api/rental/')
        .send({ ...rentalData, carID: car._id });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/rental/:carID', () => {
    let rental1, rental2;

    beforeEach(async () => {
      rental1 = await Rental.create({
        carID: car._id,
        renterName: 'John Doe',
        renterEmail: 'john@example.com',
        dateRentedOut: new Date('2024-01-01'),
        expectedReturnDate: new Date('2024-01-10'),
        rentalRatePerDay: 50
      });

      rental2 = await Rental.create({
        carID: car._id,
        renterName: 'Jane Smith',
        renterEmail: 'jane@example.com',
        dateRentedOut: new Date('2024-02-01'),
        expectedReturnDate: new Date('2024-02-10'),
        actualReturnDate: new Date('2024-02-09'),
        rentalRatePerDay: 60
      });
    });

    it('should get all rentals for a car', async () => {
      const res = await request(app)
        .get(`/api/rental/${car._id}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.rentals).toHaveLength(2);
    });

    it('should get only current rental', async () => {
      const res = await request(app)
        .get(`/api/rental/${car._id}?current=true`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.rentals).toHaveLength(1);
      expect(res.body.rentals[0].actualReturnDate).toBeUndefined();
      expect(res.body.rentals[0].renterName).toBe('John Doe');
    });

    it('should return rentals sorted by date descending', async () => {
      const res = await request(app)
        .get(`/api/rental/${car._id}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      const dates = res.body.rentals.map(r => new Date(r.dateRentedOut));
      expect(dates[0].getTime()).toBeGreaterThanOrEqual(dates[1].getTime());
    });

    it('should return empty array for car with no rentals', async () => {
      const newCar = await Car.create({
        userID: user._id,
        companyName: 'N/A',
        licensePlate: 'NEW123',
        year: 2021,
        color: 'Red',
        make: 'Honda',
        model: 'Civic',
        vehicleIdentificationNumber: 'VIN456'
      });

      const res = await request(app)
        .get(`/api/rental/${newCar._id}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.rentals).toHaveLength(0);
    });

    it('should return empty array when only past rentals exist and current=true', async () => {
      // Update rental1 to have return date
      await Rental.findByIdAndUpdate(rental1._id, {
        actualReturnDate: new Date('2024-01-09')
      });

      const res = await request(app)
        .get(`/api/rental/${car._id}?current=true`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.rentals).toHaveLength(0);
    });

    it('should reject without car ID', async () => {
      const res = await request(app)
        .get('/api/rental/')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(404);
    });

    it('should reject without authentication', async () => {
      const res = await request(app).get(`/api/rental/${car._id}`);

      expect(res.status).toBe(401);
    });

    it('should handle invalid car ID format', async () => {
      const res = await request(app)
        .get('/api/rental/invalid-id')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/rental/:id', () => {
    let rental;

    beforeEach(async () => {
      rental = await Rental.create({
        carID: car._id,
        renterName: 'John Doe',
        renterEmail: 'john@example.com',
        dateRentedOut: new Date('2024-01-01'),
        expectedReturnDate: new Date('2024-01-10'),
        rentalRatePerDay: 50
      });
    });

    it('should update rental', async () => {
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ renterName: 'John Updated', rentalRatePerDay: 75 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Rental updated successfully');

      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.renterName).toBe('John Updated');
      expect(updatedRental.rentalRatePerDay).toBe(75);
    });

    it('should update renter name', async () => {
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ renterName: 'Updated Name' });

      expect(res.status).toBe(200);
      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.renterName).toBe('Updated Name');
    });

    it('should update renter email', async () => {
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ renterEmail: 'newemail@example.com' });

      expect(res.status).toBe(200);
      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.renterEmail).toBe('newemail@example.com');
    });

    it('should update renter phone', async () => {
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ renterPhone: '555-9999' });

      expect(res.status).toBe(200);
      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.renterPhone).toBe('555-9999');
    });

    it('should update actual return date', async () => {
      const returnDate = new Date('2024-01-09');
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ actualReturnDate: returnDate });

      expect(res.status).toBe(200);

      const updatedRental = await Rental.findById(rental._id);
      expect(new Date(updatedRental.actualReturnDate).toISOString()).toBe(returnDate.toISOString());
    });

    it('should update overdue status', async () => {
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ overdueStatus: true });

      expect(res.status).toBe(200);

      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.overdueStatus).toBe(true);
    });

    it('should update rental dates', async () => {
      const newStartDate = new Date('2024-01-05');
      const newEndDate = new Date('2024-01-15');

      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          dateRentedOut: newStartDate,
          expectedReturnDate: newEndDate
        });

      expect(res.status).toBe(200);
      const updatedRental = await Rental.findById(rental._id);
      expect(new Date(updatedRental.dateRentedOut).toISOString()).toBe(newStartDate.toISOString());
      expect(new Date(updatedRental.expectedReturnDate).toISOString()).toBe(newEndDate.toISOString());
    });

    it('should update notes', async () => {
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ notes: 'Updated rental notes' });

      expect(res.status).toBe(200);
      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.notes).toBe('Updated rental notes');
    });

    it('should update rental rate', async () => {
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ rentalRatePerDay: 100 });

      expect(res.status).toBe(200);
      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.rentalRatePerDay).toBe(100);
    });

    it('should reject non-existent rental', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/rental/${fakeId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ renterName: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Rental not found');
    });

    it('should not update fields not provided', async () => {
      const originalEmail = rental.renterEmail;
      const originalPhone = rental.renterPhone;
      
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({ renterName: 'Updated Name' });

      expect(res.status).toBe(200);

      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.renterEmail).toBe(originalEmail);
      expect(updatedRental.renterPhone).toBe(originalPhone);
    });

    it('should update multiple fields at once', async () => {
      const updates = {
        renterName: 'Jane Updated',
        renterEmail: 'janeupdated@example.com',
        renterPhone: '555-8888',
        rentalRatePerDay: 90,
        overdueStatus: true,
        notes: 'Multiple field update test'
      };

      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`])
        .send(updates);

      expect(res.status).toBe(200);

      const updatedRental = await Rental.findById(rental._id);
      expect(updatedRental.renterName).toBe(updates.renterName);
      expect(updatedRental.renterEmail).toBe(updates.renterEmail);
      expect(updatedRental.renterPhone).toBe(updates.renterPhone);
      expect(updatedRental.rentalRatePerDay).toBe(updates.rentalRatePerDay);
      expect(updatedRental.overdueStatus).toBe(updates.overdueStatus);
      expect(updatedRental.notes).toBe(updates.notes);
    });

    it('should reject without authentication', async () => {
      const res = await request(app)
        .put(`/api/rental/${rental._id}`)
        .send({ renterName: 'Updated' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/rental/:id', () => {
    let rental;

    beforeEach(async () => {
      rental = await Rental.create({
        carID: car._id,
        renterName: 'John Doe',
        renterEmail: 'john@example.com',
        dateRentedOut: new Date('2024-01-01'),
        expectedReturnDate: new Date('2024-01-10'),
        rentalRatePerDay: 50
      });
    });

    it('should delete rental', async () => {
      const res = await request(app)
        .delete(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Rental deleted successfully');

      const deletedRental = await Rental.findById(rental._id);
      expect(deletedRental).toBeNull();
    });

    it('should actually remove rental from database', async () => {
      await request(app)
        .delete(`/api/rental/${rental._id}`)
        .set('Cookie', [`token=${authToken}`]);

      const rentalCount = await Rental.countDocuments({ _id: rental._id });
      expect(rentalCount).toBe(0);
    });

    it('should reject non-existent rental', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/rental/${fakeId}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Rental not found');
    });

    it('should reject without authentication', async () => {
      const res = await request(app).delete(`/api/rental/${rental._id}`);

      expect(res.status).toBe(401);
    });

    it('should reject invalid rental ID format', async () => {
      const res = await request(app)
        .delete('/api/rental/invalid-id')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/rental/car/:carID', () => {
    beforeEach(async () => {
      await Rental.create({
        carID: car._id,
        renterName: 'John Doe',
        renterEmail: 'john@example.com',
        dateRentedOut: new Date('2024-01-01'),
        expectedReturnDate: new Date('2024-01-10'),
        rentalRatePerDay: 50
      });

      await Rental.create({
        carID: car._id,
        renterName: 'Jane Smith',
        renterEmail: 'jane@example.com',
        dateRentedOut: new Date('2024-02-01'),
        expectedReturnDate: new Date('2024-02-10'),
        rentalRatePerDay: 60
      });

      await Rental.create({
        carID: car._id,
        renterName: 'Bob Johnson',
        renterEmail: 'bob@example.com',
        dateRentedOut: new Date('2024-03-01'),
        expectedReturnDate: new Date('2024-03-10'),
        rentalRatePerDay: 55
      });
    });

    it('should delete all rentals for a car', async () => {
      const res = await request(app)
        .delete(`/api/rental/car/${car._id}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Deleted 3 rental(s)');

      const remainingRentals = await Rental.find({ carID: car._id });
      expect(remainingRentals).toHaveLength(0);
    });

    it('should only delete rentals for specified car', async () => {
      // Create another car with rentals
      const anotherCar = await Car.create({
        userID: user._id,
        companyName: 'N/A',
        licensePlate: 'OTHER123',
        year: 2021,
        color: 'Red',
        make: 'Honda',
        model: 'Civic',
        vehicleIdentificationNumber: 'VIN_OTHER'
      });

      await Rental.create({
        carID: anotherCar._id,
        renterName: 'Other Renter',
        renterEmail: 'other@example.com',
        dateRentedOut: new Date('2024-01-01'),
        expectedReturnDate: new Date('2024-01-10'),
        rentalRatePerDay: 40
      });

      const res = await request(app)
        .delete(`/api/rental/car/${car._id}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);

      // Original car rentals should be deleted
      const originalCarRentals = await Rental.find({ carID: car._id });
      expect(originalCarRentals).toHaveLength(0);

      // Other car rentals should remain
      const otherCarRentals = await Rental.find({ carID: anotherCar._id });
      expect(otherCarRentals).toHaveLength(1);
    });

    it('should return 404 for car with no rentals', async () => {
      const newCar = await Car.create({
        userID: user._id,
        companyName: 'N/A',
        licensePlate: 'NEW123',
        year: 2021,
        color: 'Red',
        make: 'Honda',
        model: 'Civic',
        vehicleIdentificationNumber: 'VIN456'
      });

      const res = await request(app)
        .delete(`/api/rental/car/${newCar._id}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('No rentals found for this car');
    });

    it('should return correct deletion count', async () => {
      // Delete one rental manually first
      const rentals = await Rental.find({ carID: car._id });
      await Rental.findByIdAndDelete(rentals[0]._id);

      const res = await request(app)
        .delete(`/api/rental/car/${car._id}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Deleted 2 rental(s)');
    });

    it('should reject without authentication', async () => {
      const res = await request(app).delete(`/api/rental/car/${car._id}`);

      expect(res.status).toBe(401);
    });

    it('should handle invalid car ID format', async () => {
      const res = await request(app)
        .delete('/api/rental/car/invalid-id')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(400);
    });

    it('should handle non-existent car ID gracefully', async () => {
      const fakeCarId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/rental/car/${fakeCarId}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('No rentals found for this car');
    });
  });
});