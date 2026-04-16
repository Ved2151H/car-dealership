import carRepository from '../repositories/carRepository.js';

class CarController {
    /**
     * @desc    Get all cars (paged, filtered)
     * @route   GET /api/cars
     * @access  Public
     */
    async getCars(req, res, next) {
        try {
            const pageSize = 10;
            const page = Number(req.query.pageNumber) || 1;
            const skip = pageSize * (page - 1);

            // Construct filter object
            const filter = {};
            if (req.query.brand) filter.brand = { $regex: new RegExp(req.query.brand, 'i') };
            if (req.query.fuelType) filter['techSpecs.fuelType'] = req.query.fuelType;
            if (req.query.transmission) filter['techSpecs.transmission'] = req.query.transmission;
            
            // Text Search
            if (req.query.keyword) {
                const results = await carRepository.searchByText(req.query.keyword, filter, {}, skip, pageSize);
                return res.status(200).json(results);
            }

            const sortOptions = {};
            if (req.query.sort === 'priceLow') sortOptions.price = 1;
            if (req.query.sort === 'priceHigh') sortOptions.price = -1;
            if (req.query.sort === 'newest') sortOptions.year = -1;

            const results = await carRepository.findAll(filter, sortOptions, skip, pageSize);
            res.status(200).json(results);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Get car by ID
     * @route   GET /api/cars/:id
     * @access  Public
     */
    async getCarById(req, res, next) {
        try {
            const car = await carRepository.findById(req.params.id);
            if (car) {
                res.status(200).json(car);
            } else {
                res.status(404).json({ message: 'Car not found' });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Create a car
     * @route   POST /api/cars
     * @access  Private/Admin
     */
    async createCar(req, res, next) {
        try {
            const carData = { ...req.body, createdBy: req.user._id };
            const createdCar = await carRepository.create(carData);
            res.status(201).json(createdCar);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Update a car
     * @route   PUT /api/cars/:id
     * @access  Private/Admin
     */
    async updateCar(req, res, next) {
        try {
            const updatedCar = await carRepository.update(req.params.id, req.body);
            if (updatedCar) {
                res.status(200).json(updatedCar);
            } else {
                res.status(404).json({ message: 'Car not found' });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Delete a car
     * @route   DELETE /api/cars/:id
     * @access  Private/Admin
     */
    async deleteCar(req, res, next) {
        try {
            const deleted = await carRepository.delete(req.params.id);
            if (deleted) {
                res.status(200).json({ message: 'Car removed' });
            } else {
                res.status(404).json({ message: 'Car not found' });
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new CarController();
