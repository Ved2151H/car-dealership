import express from 'express';
import carController from '../controllers/carController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(carController.getCars)
    .post(protect, admin, carController.createCar);

router.route('/:id')
    .get(carController.getCarById)
    .put(protect, admin, carController.updateCar)
    .delete(protect, admin, carController.deleteCar);

export default router;
