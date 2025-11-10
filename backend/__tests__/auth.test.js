import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import authRoutes from '../src/routes/auth-route.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

// Mock JWT generation
jest.mock('../src/utils/generateJWTToken.js', () => ({
    generateJWTToken: jest.fn((res, userId) => {
        res.cookie('token', 'mock-jwt-token');
    })
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new solo user', async () => {
            const userData = {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
                userType: 'solo'
            };

            const res = await request(app)
                .post('/api/auth/signup')
                .send(userData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user.email).toBe(userData.email);
            expect(res.body.user.passwordHash).toBeUndefined();
        });

        it('should create a company admin', async () => {
            const userData = {
                email: 'admin@company.com',
                firstName: 'Admin',
                lastName: 'User',
                password: 'password123',
                userType: 'company_admin',
                companyName: 'Test Company'
            };

            const res = await request(app)
                .post('/api/auth/signup')
                .send(userData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user.companyName).toBe('Test Company');
        });

        it('should reject signup without required fields', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Basic fields are required');
        });

        it('should reject duplicate email', async () => {
            const userData = {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
                userType: 'solo'
            };

            await request(app).post('/api/auth/signup').send(userData);
            const res = await request(app).post('/api/auth/signup').send(userData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });

        it('should reject company member without company name', async () => {
            const userData = {
                email: 'member@example.com',
                firstName: 'Member',
                lastName: 'User',
                password: 'password123',
                userType: 'company_member'
            };

            const res = await request(app)
                .post('/api/auth/signup')
                .send(userData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Company name is required for company users');
        });

        it('should reject company member if company does not exist', async () => {
            const userData = {
                email: 'member@example.com',
                firstName: 'Member',
                lastName: 'User',
                password: 'password123',
                userType: 'company_member',
                companyName: 'Non-Existent Company'
            };

            const res = await request(app)
                .post('/api/auth/signup')
                .send(userData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Company does not exist');
        });

        it('should reject duplicate company name for admin', async () => {
            const adminData = {
                email: 'admin1@company.com',
                firstName: 'Admin',
                lastName: 'One',
                password: 'password123',
                userType: 'company_admin',
                companyName: 'Test Company'
            };

            await request(app).post('/api/auth/signup').send(adminData);

            const duplicateAdmin = {
                ...adminData,
                email: 'admin2@company.com'
            };

            const res = await request(app)
                .post('/api/auth/signup')
                .send(duplicateAdmin);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Company already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                passwordHash: hashedPassword,
                userType: 'solo',
                isEmailVerified: true,
                isAdminVerified: true
            });
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Login successfully');
        });

        it('should reject login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should reject login for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@example.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should reject login if email not verified', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'unverified@example.com',
                firstName: 'Unverified',
                lastName: 'User',
                passwordHash: hashedPassword,
                userType: 'solo',
                isEmailVerified: false,
                isAdminVerified: true
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'unverified@example.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Please verify your email first');
        });

        it('should reject login for company member without admin approval', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'member@company.com',
                firstName: 'Member',
                lastName: 'User',
                passwordHash: hashedPassword,
                userType: 'company_member',
                companyName: 'Test Company',
                isEmailVerified: true,
                isAdminVerified: false
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'member@company.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Please wait for company admin approval');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const res = await request(app).post('/api/auth/logout');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Logged out successfully!');
        });
    });

    describe('GET /api/auth/verify/:token', () => {
        it('should verify email with valid token', async () => {
            const token = 'valid-token-123';
            await User.create({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                passwordHash: 'hashedpassword',
                userType: 'solo',
                isEmailVerified: false,
                verificationToken: token,
                verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
            });

            const res = await request(app).get(`/api/auth/verify/${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Email verified successfully');

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user.isEmailVerified).toBe(true);
            expect(user.verificationToken).toBeUndefined();
        });

        it('should reject invalid verification token', async () => {
            const res = await request(app).get('/api/auth/verify/invalid-token');

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid or expired verification code');
        });

        it('should reject expired verification token', async () => {
            const token = 'expired-token-123';
            await User.create({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                passwordHash: 'hashedpassword',
                userType: 'solo',
                isEmailVerified: false,
                verificationToken: token,
                verificationTokenExpiresAt: Date.now() - 1000
            });

            const res = await request(app).get(`/api/auth/verify/${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid or expired verification code');
        });

        it('should reject duplicate email verification', async () => {
            const token = 'valid-token-123';
            await User.create({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                passwordHash: 'hashedpassword',
                userType: 'solo',
                isEmailVerified: true,
                verificationToken: token,
                verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
            });

            const res = await request(app).get(`/api/auth/verify/${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email is already verified');
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        beforeEach(async () => {
            await User.create({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                passwordHash: 'hashedpassword',
                userType: 'solo',
                isEmailVerified: true
            });
        });

        it('should send password reset email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Password reset email sent successfully');

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user.resetPasswordToken).toBeDefined();
            expect(user.resetPasswordExpiresAt).toBeDefined();
        });

        it('should reject for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User not found');
        });
    });

    describe('POST /api/auth/reset-password/:token', () => {
        let resetToken;

        beforeEach(async () => {
            resetToken = 'reset-token-123';
            await User.create({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                passwordHash: 'oldhashedpassword',
                userType: 'solo',
                isEmailVerified: true,
                resetPasswordToken: resetToken,
                resetPasswordExpiresAt: Date.now() + 60 * 60 * 1000
            });
        });

        it('should reset password with valid token', async () => {
            const res = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({ password: 'newpassword123' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Password reset successful');

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user.resetPasswordToken).toBeUndefined();
            expect(user.resetPasswordExpiresAt).toBeUndefined();
        });

        it('should reject without password', async () => {
            const res = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Password is required.');
        });

        it('should reject with invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password/invalid-token')
                .send({ password: 'newpassword123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid or expired reset token');
        });

        it('should reject with expired token', async () => {
            const expiredToken = 'expired-reset-token';
            await User.create({
                email: 'expired@example.com',
                firstName: 'Expired',
                lastName: 'User',
                passwordHash: 'hashedpassword',
                userType: 'solo',
                resetPasswordToken: expiredToken,
                resetPasswordExpiresAt: Date.now() - 1000
            });

            const res = await request(app)
                .post(`/api/auth/reset-password/${expiredToken}`)
                .send({ password: 'newpassword123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid or expired reset token');
        });
    });
});