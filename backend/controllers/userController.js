import userRepository from '../repositories/userRepository.js';

class UserController {
    /**
     * @desc    Get user profile
     * @route   GET /api/users/profile
     * @access  Private
     */
    async getUserProfile(req, res, next) {
        try {
            const user = await userRepository.findById(req.user._id);
            if (user) {
                await user.populate('wishlist');
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Update user profile
     * @route   PUT /api/users/profile
     * @access  Private
     */
    async updateUserProfile(req, res, next) {
        try {
            // Can update name, phone etc. (Not role or password here)
            const updateData = { name: req.body.name, phone: req.body.phone };
            const updatedUser = await userRepository.update(req.user._id, updateData);
            
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Add car to wishlist
     * @route   POST /api/users/wishlist
     * @access  Private
     */
    async addToWishlist(req, res, next) {
        try {
            const { carId } = req.body;
            const user = await userRepository.addCarToWishlist(req.user._id, carId);
            
            // Optionally add to activity history
            await userRepository.addActivity(req.user._id, { action: 'Added to Wishlist', carId });
            
            res.status(200).json(user.wishlist);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Remove car from wishlist
     * @route   DELETE /api/users/wishlist/:carId
     * @access  Private
     */
    async removeFromWishlist(req, res, next) {
        try {
            const { carId } = req.params;
            const user = await userRepository.removeCarFromWishlist(req.user._id, carId);
            
            await userRepository.addActivity(req.user._id, { action: 'Removed from Wishlist', carId });

            res.status(200).json(user.wishlist);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Delete user account
     * @route   DELETE /api/users/profile
     * @access  Private
     */
    async deleteUserAccount(req, res, next) {
        try {
            await userRepository.deleteUser(req.user._id);
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Get all users (admin only)
     * @route   GET /api/users/all
     * @access  Private/Admin
     */
    async getAllUsers(req, res, next) {
        try {
            const users = await userRepository.findAll();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Admin deletes a user by ID
     * @route   DELETE /api/users/:id
     * @access  Private/Admin
     */
    async adminDeleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            const user = await userRepository.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await userRepository.deleteUser(userId);
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
