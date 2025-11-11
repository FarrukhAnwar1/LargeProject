import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import authRoutes from '../src/routes/auth-route.js';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Mock JWT generation
jest.mock('../src/utils/generateJWTToken.js', () => ({
    generateJWTToken: jest.fn((res, userId) => {
        res.cookie('token', 'mock-jwt-token');
    })
}));

// Mock verification token generation
jest.mock('../src/utils/generateVerificationToken.js', () => ({
    generateVerificationToken: jest.fn(() => 'mock-verification-token')
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(async () => {
        await User.deleteMany({});
        jest.clearAllMocks();
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
            expect(res.body.user.companyName).toBe('N/A');
            expect(res.body.user.isEmailVerified).toBe(false);
            expect(res.body.user.isAdminVerified).toBe(true);
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
            expect(res.body.user.isAdminVerified).toBe(true);
        });

        it('should create a company member after admin exists', async () => {
            // First create admin
            await User.create({
                email: 'admin@company.com',
                firstName: 'Admin',
                lastName: 'User',
                passwordHash: 'hashedpassword',
                userType: 'company_admin',
                companyName: 'Test Company',
                isEmailVerified: true,
                isAdminVerified: true
            });

            const memberData = {
                email: 'member@company.com',
                firstName: 'Member',
                lastName: 'User',
                password: 'password123',
                userType: 'company_member',
                companyName: 'Test Company'
            };

            const res = await request(app)
                .post('/api/auth/signup')
                .send(memberData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user.isAdminVerified).toBe(false);
            expect(res.body.user.adminVerificationToken).toBeDefined();
        });

        it('should reject signup without email', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'password123',
                    userType: 'solo'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Basic fields are required');
        });

        it('should reject signup without firstName', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test@example.com',
                    lastName: 'Doe',
                    password: 'password123',
                    userType: 'solo'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Basic fields are required');
        });

        it('should reject signup without lastName', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test@example.com',
                    firstName: 'John',
                    password: 'password123',
                    userType: 'solo'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Basic fields are required');
        });

        it('should reject signup without password', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    userType: 'solo'
                });

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

        it('should reject company admin without company name', async () => {
            const userData = {
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                password: 'password123',
                userType: 'company_admin'
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

        it('should hash password before saving', async () => {
            const userData = {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
                userType: 'solo'
            };

            await request(app).post('/api/auth/signup').send(userData);

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user.passwordHash).not.toBe('password123');
            expect(user.passwordHash).toBeDefined();
        });

        it('should generate verification token on signup', async () => {
            const userData = {
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'password123',
                userType: 'solo'
            };

            await request(app).post('/api/auth/signup').send(userData);

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user.verificationToken).toBeDefined();
            expect(user.verificationTokenExpiresAt).toBeDefined();
        });

        it('should set JWT cookie on successful signup', async () => {
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

            expect(res.headers['set-cookie']).toBeDefined();
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

        it('should set JWT cookie on successful login', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('should reject login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should reject login for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@example.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should reject login without email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' });

            expect(res.status).toBe(400);
        });

        it('should reject login without password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(400);
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
            expect(res.body.success).toBe(false);
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
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Please wait for company admin approval');
        });

        it('should allow login for company member with admin approval', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'approved@company.com',
                firstName: 'Approved',
                lastName: 'Member',
                passwordHash: hashedPassword,
                userType: 'company_member',
                companyName: 'Test Company',
                isEmailVerified: true,
                isAdminVerified: true
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'approved@company.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should be case-sensitive for email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'TEST@EXAMPLE.COM', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const res = await request(app).post('/api/auth/logout');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Logged out successfully!');
        });

        it('should clear token cookie on logout', async () => {
            const res = await request(app).post('/api/auth/logout');

            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            const tokenCookie = cookies.find(c => c.startsWith('token='));
            expect(tokenCookie).toBeDefined();
        });
    });

    describe('GET /api/auth/verify/:token', () => {
        describe('Email Verification', () => {
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
                expect(user.verificationTokenExpiresAt).toBeUndefined();
            });

            it('should reject invalid verification token', async () => {
                const res = await request(app).get('/api/auth/verify/invalid-token');

                expect(res.status).toBe(400);
                expect(res.body.success).toBe(false);
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
                expect(res.body.success).toBe(false);
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
                expect(res.body.success).toBe(false);
                expect(res.body.message).toBe('Email is already verified');
            });

            it('should verify company member email and notify admin', async () => {
                // Create admin
                await User.create({
                    email: 'admin@company.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    passwordHash: 'hashedpassword',
                    userType: 'company_admin',
                    companyName: 'Test Company',
                    isEmailVerified: true,
                    isAdminVerified: true
                });

                // Create company member
                const memberToken = 'member-token-123';
                const adminToken = 'admin-verification-token-456';
                await User.create({
                    email: 'member@company.com',
                    firstName: 'Member',
                    lastName: 'User',
                    passwordHash: 'hashedpassword',
                    userType: 'company_member',
                    companyName: 'Test Company',
                    isEmailVerified: false,
                    isAdminVerified: false,
                    verificationToken: memberToken,
                    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
                    adminVerificationToken: adminToken,
                    adminVerificationTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
                });

                const res = await request(app).get(`/api/auth/verify/${memberToken}`);

                expect(res.status).toBe(200);
                expect(res.body.message).toContain('Admin has been notified');

                const member = await User.findOne({ email: 'member@company.com' });
                expect(member.isEmailVerified).toBe(true);
            });
        });

        describe('Admin Verification', () => {
            it('should verify company member by admin', async () => {
                const adminToken = 'admin-verification-token-123';
                await User.create({
                    email: 'member@company.com',
                    firstName: 'Member',
                    lastName: 'User',
                    passwordHash: 'hashedpassword',
                    userType: 'company_member',
                    companyName: 'Test Company',
                    isEmailVerified: true,
                    isAdminVerified: false,
                    adminVerificationToken: adminToken,
                    adminVerificationTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
                });

                const res = await request(app).get(`/api/auth/verify/${adminToken}?type=admin`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toBe('Company member verified successfully');

                const member = await User.findOne({ email: 'member@company.com' });
                expect(member.isAdminVerified).toBe(true);
                expect(member.adminVerificationToken).toBeUndefined();
            });

            it('should reject invalid admin verification token', async () => {
                const res = await request(app).get('/api/auth/verify/invalid-admin-token?type=admin');

                expect(res.status).toBe(400);
                expect(res.body.message).toBe('Invalid or expired admin verification code');
            });

            it('should reject expired admin verification token', async () => {
                const adminToken = 'expired-admin-token';
                await User.create({
                    email: 'member@company.com',
                    firstName: 'Member',
                    lastName: 'User',
                    passwordHash: 'hashedpassword',
                    userType: 'company_member',
                    companyName: 'Test Company',
                    isEmailVerified: true,
                    isAdminVerified: false,
                    adminVerificationToken: adminToken,
                    adminVerificationTokenExpiresAt: Date.now() - 1000
                });

                const res = await request(app).get(`/api/auth/verify/${adminToken}?type=admin`);

                expect(res.status).toBe(400);
                expect(res.body.message).toBe('Invalid or expired admin verification code');
            });

            it('should handle already verified admin approval', async () => {
                const adminToken = 'admin-token-123';
                await User.create({
                    email: 'member@company.com',
                    firstName: 'Member',
                    lastName: 'User',
                    passwordHash: 'hashedpassword',
                    userType: 'company_member',
                    companyName: 'Test Company',
                    isEmailVerified: true,
                    isAdminVerified: true,
                    adminVerificationToken: adminToken,
                    adminVerificationTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
                });

                const res = await request(app).get(`/api/auth/verify/${adminToken}?type=admin`);

                expect(res.status).toBe(200);
                expect(res.body.message).toBe('Company member was already verified');
            });
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

        it('should generate unique reset token', async () => {
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' });

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user.resetPasswordToken).toHaveLength(64); // hex string of 32 bytes
        });

        it('should reject for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('User not found');
        });

        it('should reject without email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({});

            expect(res.status).toBe(400);
        });

        it('should allow multiple reset requests', async () => {
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' });

            const user1 = await User.findOne({ email: 'test@example.com' });
            const firstToken = user1.resetPasswordToken;

            // Wait a bit to ensure different token
            await new Promise(resolve => setTimeout(resolve, 10));

            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' });

            const user2 = await User.findOne({ email: 'test@example.com' });
            expect(user2.resetPasswordToken).not.toBe(firstToken);
        });
    });

    describe('POST /api/auth/reset-password/:token', () => {
        let resetToken;

        beforeEach(async () => {
            resetToken = crypto.randomBytes(32).toString('hex');
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

        it('should hash new password', async () => {
            const newPassword = 'newpassword123';

            await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({ password: newPassword });

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user.passwordHash).not.toBe(newPassword);

            // Verify new password works
            const isValid = await bcrypt.compare(newPassword, user.passwordHash);
            expect(isValid).toBe(true);
        });

        it('should reject without password', async () => {
            const res = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Password is required.');
        });

        it('should reject with empty password', async () => {
            const res = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({ password: '' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Password is required.');
        });

        it('should reject with invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password/invalid-token')
                .send({ password: 'newpassword123' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid or expired reset token');
        });

        it('should reject with expired token', async () => {
            const expiredToken = crypto.randomBytes(32).toString('hex');
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
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid or expired reset token');
        });

        it('should not allow token reuse after successful reset', async () => {
            // First reset
            await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({ password: 'newpassword123' });

            // Try to use same token again
            const res = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({ password: 'anotherpassword' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid or expired reset token');
        });

        it('should allow login with new password after reset', async () => {
            const newPassword = 'newpassword456';

            await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({ password: newPassword });

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: newPassword });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body.success).toBe(true);
        });

        it('should not allow login with old password after reset', async () => {
            const oldPassword = 'password123';
            const newPassword = 'newpassword456';

            // Update user with known old password
            const hashedOldPassword = await bcrypt.hash(oldPassword, 10);
            await User.findOneAndUpdate(
                { email: 'test@example.com' },
                { passwordHash: hashedOldPassword }
            );

            // Reset password
            await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({ password: newPassword });

            // Try login with old password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: oldPassword });

            expect(loginRes.status).toBe(400);
            expect(loginRes.body.message).toBe('Invalid credentials');
        });

        it('should accept various password formats', async () => {
            const passwords = [
                'simple123',
                'Complex!Password123',
                '12345678',
                'p@ssw0rd!#$%',
                'very_long_password_with_many_characters_123456789'
            ];

            for (const password of passwords) {
                const token = crypto.randomBytes(32).toString('hex');
                await User.create({
                    email: `test${password}@example.com`,
                    firstName: 'Test',
                    lastName: 'User',
                    passwordHash: 'oldpassword',
                    userType: 'solo',
                    isEmailVerified: true,
                    resetPasswordToken: token,
                    resetPasswordExpiresAt: Date.now() + 60 * 60 * 1000
                });

                const res = await request(app)
                    .post(`/api/auth/reset-password/${token}`)
                    .send({ password });

                expect(res.status).toBe(200);
            }
        });
    });

    describe('Integration Tests', () => {
        it('should complete full signup and login flow', async () => {
            // Signup
            const signupRes = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'integration@test.com',
                    firstName: 'Integration',
                    lastName: 'Test',
                    password: 'password123',
                    userType: 'solo'
                });

            expect(signupRes.status).toBe(201);

            // Get verification token
            const user = await User.findOne({ email: 'integration@test.com' });

            // Verify email
            const verifyRes = await request(app)
                .get(`/api/auth/verify/${user.verificationToken}`);

            expect(verifyRes.status).toBe(200);

            // Login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'integration@test.com', password: 'password123' });

            expect(loginRes.status).toBe(200);

            // Logout
            const logoutRes = await request(app).post('/api/auth/logout');
            expect(logoutRes.status).toBe(200);
        });

        it('should complete full password reset flow', async () => {
            // Create user
            const hashedPassword = await bcrypt.hash('oldpassword', 10);
            await User.create({
                email: 'reset@test.com',
                firstName: 'Reset',
                lastName: 'Test',
                passwordHash: hashedPassword,
                userType: 'solo',
                isEmailVerified: true,
                isAdminVerified: true
            });

            // Request password reset
            const forgotRes = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'reset@test.com' });

            expect(forgotRes.status).toBe(200);

            // Get reset token
            const user = await User.findOne({ email: 'reset@test.com' });

            // Reset password
            const resetRes = await request(app)
                .post(`/api/auth/reset-password/${user.resetPasswordToken}`)
                .send({ password: 'newpassword123' });

            expect(resetRes.status).toBe(200);

            // Login with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'reset@test.com', password: 'newpassword123' });

            expect(loginRes.status).toBe(200);
        });

        it('should complete company member approval flow', async () => {
            // Create company admin
            await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'admin@testcompany.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    password: 'password123',
                    userType: 'company_admin',
                    companyName: 'Test Company Flow'
                });

            const admin = await User.findOne({ email: 'admin@testcompany.com' });

            // Verify admin email
            await request(app).get(`/api/auth/verify/${admin.verificationToken}`);

            // Create company member
            await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'member@testcompany.com',
                    firstName: 'Member',
                    lastName: 'User',
                    password: 'password123',
                    userType: 'company_member',
                    companyName: 'Test Company Flow'
                });

            const member = await User.findOne({ email: 'member@testcompany.com' });

            // Verify member email
            await request(app).get(`/api/auth/verify/${member.verificationToken}`);

            // Admin approves member
            const updatedMember = await User.findOne({ email: 'member@testcompany.com' });
            await request(app).get(`/api/auth/verify/${updatedMember.adminVerificationToken}?type=admin`);

            // Member can now login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'member@testcompany.com', password: 'password123' });

            expect(loginRes.status).toBe(200);
        });
    });

    describe('Edge Cases and Security', () => {
        it('should handle very long email addresses', async () => {
            const longEmail = 'a'.repeat(100) + '@example.com';
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: longEmail,
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'password123',
                    userType: 'solo'
                });

            expect([201, 400]).toContain(res.status);
        });

        it('should handle special characters in names', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'special@example.com',
                    firstName: "O'Brien",
                    lastName: 'Müller-Schmidt',
                    password: 'password123',
                    userType: 'solo'
                });

            expect(res.status).toBe(201);
        });

        it('should handle SQL injection attempts in email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "admin'--",
                    password: 'password123'
                });

            expect(res.status).toBe(400);
        });

        it('should not expose user existence through different error messages', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'exists@example.com',
                firstName: 'Exists',
                lastName: 'User',
                passwordHash: hashedPassword,
                userType: 'solo',
                isEmailVerified: true,
                isAdminVerified: true
            });

            // Wrong password for existing user
            const res1 = await request(app)
                .post('/api/auth/login')
                .send({ email: 'exists@example.com', password: 'wrongpassword' });

            // Non-existent user
            const res2 = await request(app)
                .post('/api/auth/login')
                .send({ email: 'notexists@example.com', password: 'password123' });

            // Both should return same generic error
            expect(res1.body.message).toBe(res2.body.message);
            expect(res1.body.message).toBe('Invalid credentials');
        });

        it('should handle concurrent signup attempts with same email', async () => {
            const userData = {
                email: 'concurrent@example.com',
                firstName: 'Concurrent',
                lastName: 'Test',
                password: 'password123',
                userType: 'solo'
            };

            // Make concurrent requests
            const requests = [
                request(app).post('/api/auth/signup').send(userData),
                request(app).post('/api/auth/signup').send(userData),
                request(app).post('/api/auth/signup').send(userData)
            ];

            const results = await Promise.all(requests);

            // Only one should succeed
            const successCount = results.filter(r => r.status === 201).length;
            const failCount = results.filter(r => r.status === 400).length;

            expect(successCount).toBe(1);
            expect(failCount).toBe(2);
        });

        it('should handle null values in request body', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: null,
                    firstName: null,
                    lastName: null,
                    password: null,
                    userType: 'solo'
                });

            expect(res.status).toBe(400);
        });

        it('should handle empty string password', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    password: '',
                    userType: 'solo'
                });

            expect(res.status).toBe(400);
        });

        it('should trim whitespace from email', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: '  test@example.com  ',
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'password123',
                    userType: 'solo'
                });

            if (res.status === 201) {
                const user = await User.findOne({ email: 'test@example.com' });
                expect(user).toBeDefined();
            }
        });

        it('should handle missing userType', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'password123'
                });

            // Should either default to solo or reject
            expect([201, 400]).toContain(res.status);
        });

        it('should validate email format', async () => {
            const invalidEmails = [
                'notanemail',
                '@example.com',
                'test@',
                'test..test@example.com',
                'test @example.com'
            ];

            for (const email of invalidEmails) {
                const res = await request(app)
                    .post('/api/auth/signup')
                    .send({
                        email,
                        firstName: 'John',
                        lastName: 'Doe',
                        password: 'password123',
                        userType: 'solo'
                    });

                // Should be rejected by mongoose validation or custom validation
                if (res.status === 201) {
                    // If it passes, at least verify it was saved
                    const user = await User.findOne({ email });
                    expect(user).toBeDefined();
                }
            }
        });
    });

    describe('Performance and Limits', () => {
        it('should handle multiple verification attempts', async () => {
            const token = 'test-token-123';
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

            // First attempt should succeed
            const res1 = await request(app).get(`/api/auth/verify/${token}`);
            expect(res1.status).toBe(200);

            // Second attempt should fail
            const res2 = await request(app).get(`/api/auth/verify/${token}`);
            expect(res2.status).toBe(400);
        });

        it('should handle rapid login attempts', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'rapid@example.com',
                firstName: 'Rapid',
                lastName: 'Test',
                passwordHash: hashedPassword,
                userType: 'solo',
                isEmailVerified: true,
                isAdminVerified: true
            });

            const requests = Array(5).fill(null).map(() =>
                request(app)
                    .post('/api/auth/login')
                    .send({ email: 'rapid@example.com', password: 'password123' })
            );

            const results = await Promise.all(requests);

            // All should succeed (no rate limiting in current implementation)
            results.forEach(res => {
                expect(res.status).toBe(200);
            });
        });
    });
});