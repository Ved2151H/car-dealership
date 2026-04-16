import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        // and any origin (local network devices, localhost, etc.)
        callback(null, true);
    },
    credentials: true,
}));

// Rate Limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

import uploadRoutes from './routes/uploadRoutes.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
