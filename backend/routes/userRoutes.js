import express from 'express';
import userController from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes below are protected

router.route('/profile')
    .get(userController.getUserProfile)
    .put(userController.updateUserProfile)
    .delete(userController.deleteUserAccount);

router.route('/wishlist')
    .post(userController.addToWishlist);

router.route('/wishlist/:carId')
    .delete(userController.removeFromWishlist);

// Admin only
router.route('/all')
    .get(admin, userController.getAllUsers);

router.route('/:id')
    .delete(admin, userController.adminDeleteUser);

export default router;
