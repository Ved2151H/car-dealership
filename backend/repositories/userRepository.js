import User from '../models/User.js';

class UserRepository {
    async findAll() {
        return await User.find().select('-password -otp -otpExpiry').populate('wishlist');
    }

    async findById(id) {
        return await User.findById(id).select('-password');
    }

    async findByPhone(phone) {
        return await User.findOne({ phone });
    }

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async create(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async update(id, updateData) {
        // Find by Id and update
        return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }

    async addCarToWishlist(userId, carId) {
        return await User.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: carId } },
            { new: true }
        ).select('-password');
    }

    async removeCarFromWishlist(userId, carId) {
        return await User.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: carId } },
            { new: true }
        ).select('-password');
    }

    async addActivity(userId, activity) {
        return await User.findByIdAndUpdate(
            userId,
            { $push: { activityHistory: activity } },
            { new: true }
        );
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }

    async saveOtp(userId, otp, otpExpiry) {
        return await User.findByIdAndUpdate(userId, { otp, otpExpiry }, { new: true });
    }

    async clearOtp(userId) {
        return await User.findByIdAndUpdate(userId, { otp: null, otpExpiry: null, phoneVerified: true }, { new: true });
    }
}

export default new UserRepository();
