import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
    '/register',
    optionalAuth,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters'),
    ],
    authController.register
);

router.post(
    '/login',
    [
        body('email').isEmail(),
        body('password').exists(),
    ],
    authController.login
);

router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

// OTP Routes (protected - user must be logged in)
router.post('/send-otp', protect, authController.sendOtp);
router.post('/verify-otp', protect, authController.verifyOtp);

export default router;
