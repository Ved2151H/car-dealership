import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes via verifying Access Token
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Role-Based Access Control Middleware
 * Requires the user to be an admin. Must be used AFTER protect middleware.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

/**
 * Optional auth middleware — attaches req.user if token exists, 
 * but does NOT block if no token is provided.
 * Used for routes that work for both guests and authenticated users.
 */
const optionalAuth = async (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token invalid — proceed as guest
            req.user = null;
        }
    }
    next();
};

export { protect, admin, optionalAuth };
