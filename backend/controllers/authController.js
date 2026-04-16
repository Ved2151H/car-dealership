import authService from '../services/authService.js';
import { validationResult } from 'express-validator';

class AuthController {
    async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password, phone, role } = req.body;

            // Only allow admin creation if requested by an authenticated admin
            let assignedRole = 'user';
            if (role === 'admin') {
                if (req.user && req.user.role === 'admin') {
                    assignedRole = 'admin';
                } else {
                    return res.status(403).json({ message: 'Only admins can create admin accounts' });
                }
            }

            const result = await authService.register(name, email, password, phone, assignedRole);

            // Set HTTP-only cookie for refresh token
            res.cookie('jwt', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
                sameSite: 'strict', // Prevent CSRF attacks
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            const { refreshToken, ...userData } = result;
            res.status(201).json(userData);
        } catch (error) {
            if (error.message === 'User already exists') {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            // Set HTTP-only cookie for refresh token
            res.cookie('jwt', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            const { refreshToken, ...userData } = result;
            res.status(200).json(userData);
        } catch (error) {
            if (error.message === 'Invalid email or password') {
                return res.status(401).json({ message: error.message });
            }
            next(error);
        }
    }

    async logout(req, res) {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }

    async refresh(req, res, next) {
        try {
            const token = req.cookies.jwt;
            if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

            const result = await authService.refresh(token);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    async sendOtp(req, res, next) {
        try {
            const result = await authService.sendOtp(req.user._id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async verifyOtp(req, res, next) {
        try {
            const { otp } = req.body;
            const result = await authService.verifyOtp(req.user._id, otp);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new AuthController();
