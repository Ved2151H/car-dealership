import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = (await import('./models/User.js')).default;
    const admin = await User.findOne({ email: 'veddhanokat@gmail.com' });
    
    if (admin) {
        console.log('ADMIN FOUND:', admin.email, 'Role:', admin.role);
    } else {
        console.log('ADMIN NOT FOUND!');
    }
    process.exit(0);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
