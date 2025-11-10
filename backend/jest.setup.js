// jest.setup.js
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Mock the email service
jest.mock('./resend/email.js', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({}),
    sendResetSuccessEmail: jest.fn().mockResolvedValue({})
}));

// Set test timeout
jest.setTimeout(10000);

// Global test setup
beforeAll(() => {
    console.log('Starting test suite...');
});

afterAll(() => {
    console.log('Test suite completed.');
});