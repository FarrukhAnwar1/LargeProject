// __mocks__/email.mock.js
import { jest } from '@jest/globals';

export const sendVerificationEmail = jest.fn().mockResolvedValue({ id: 'mock-id' });
export const sendPasswordResetEmail = jest.fn().mockResolvedValue({});
export const sendResetSuccessEmail = jest.fn().mockResolvedValue({});