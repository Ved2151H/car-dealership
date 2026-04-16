import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';
import emailService from './emailService.js';

class AuthService {
    /**
     * Generate an Access Token (short lived, e.g., 15m)
     */
    generateAccessToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });
    }

    /**
     * Generate a Refresh Token (long lived, e.g., 30d)
     */
    generateRefreshToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '30d',
        });
    }

    /**
     * Register a new user
     */
    async register(name, email, password, phone, role = 'user') {
        const userExists = await userRepository.findByEmail(email);

        if (userExists) {
            throw new Error('User already exists');
        }

        const user = await userRepository.create({
            name,
            email,
            password,
            phone,
            role,
        });

        if (user) {
            return this.generateAuthResponse(user);
        } else {
            throw new Error('Invalid user data');
        }
    }

    /**
     * Authenticate existing user
     */
    async login(email, password) {
        const user = await userRepository.findByEmail(email);

        if (user && (await user.matchPassword(password))) {
            return this.generateAuthResponse(user);
        } else {
            throw new Error('Invalid email or password');
        }
    }

    /**
     * Helper to return standard auth payload
     */
    generateAuthResponse(user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: this.generateAccessToken(user._id),
            refreshToken: this.generateRefreshToken(user._id),
        };
    }
    
    /**
     * Re-issue new access token using refresh token
     */
    async refresh(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            const user = await userRepository.findById(decoded.id);

            if (!user) {
                throw new Error('User not found');
            }

            return {
                accessToken: this.generateAccessToken(user._id),
            };
        } catch (error) {
            throw new Error('Not authorized, token failed');
        }
    }

    /**
     * Generate and send a 6-digit OTP.
     * Detects whether user has phone or email and sends via the appropriate channel.
     * OTP is NEVER returned in the API response.
     */
    async sendOtp(userId) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error('User not found');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await userRepository.saveOtp(userId, otp, otpExpiry);

        let channel = 'unknown';

        if (user.email) {
            // Send OTP via email
            try {
                await emailService.sendOtpEmail(user.email, otp);
                channel = 'email';
            } catch (emailErr) {
                console.error('Email OTP failed, falling back to console:', emailErr.message);
                // If email fails (e.g. no SMTP configured), log to console as fallback
                console.log(`📧 [FALLBACK] OTP for ${user.email}: ${otp}`);
                channel = 'email (console fallback)';
            }
        }

        if (user.phone && !user.email) {
            // Send OTP via SMS (requires Twilio or similar — console log for now)
            console.log(`📱 SMS OTP for ${user.phone}: ${otp}`);
            channel = 'phone';
        }

        // Never expose OTP in response
        return { 
            message: `Verification code sent to your ${channel === 'phone' ? 'phone' : 'email'}`,
            channel 
        };
    }

    /**
     * Verify the OTP entered by user
     */
    async verifyOtp(userId, enteredOtp) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error('User not found');

        // Need raw user doc to read otp fields (they're excluded by select('-password'))
        const User = (await import('../models/User.js')).default;
        const rawUser = await User.findById(userId);

        if (!rawUser.otp || !rawUser.otpExpiry) {
            throw new Error('No OTP requested. Please request a new code.');
        }

        if (new Date() > rawUser.otpExpiry) {
            throw new Error('OTP has expired. Please request a new code.');
        }

        if (rawUser.otp !== enteredOtp) {
            throw new Error('Invalid OTP. Please try again.');
        }

        await userRepository.clearOtp(userId);
        return { message: 'Verification successful! Your account is now verified.' };
    }
}

export default new AuthService();

