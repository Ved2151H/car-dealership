import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to MongoDB');

        const adminEmail = 'veddhanokat@gmail.com';
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        // Create the admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('ved@2006', salt);

        const adminUser = new User({
            name: 'Ved Dhanokar',
            email: adminEmail,
            password: 'ved@2006', // The pre('save') hook in User.js will hash this automatically!
            role: 'admin',
        });

        await adminUser.save();

        console.log('SUCCESS: Admin user seeded!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
