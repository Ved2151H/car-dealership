import Car from '../models/Car.js';

class CarRepository {
    async findAll(filter = {}, sort = {}, skip = 0, limit = 10) {
        const query = Car.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name email');
        
        const count = await Car.countDocuments(filter);
        const data = await query.exec();

        return { data, count, page: Math.floor(skip / limit) + 1, pages: Math.ceil(count / limit) };
    }

    async findById(id) {
        return await Car.findById(id).populate('createdBy', 'name email');
    }

    async create(carData) {
        const car = new Car(carData);
        return await car.save();
    }

    async update(id, updateData) {
        return await Car.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async delete(id) {
        return await Car.findByIdAndDelete(id);
    }

    async searchByText(text, filter = {}, sort = {}, skip = 0, limit = 10) {
        const searchQuery = { 
            ...filter, 
            $text: { $search: text } 
        };
        
        // Add score for sorting by relevance if no other sort is provided
        const sortOptions = Object.keys(sort).length === 0 ? { score: { $meta: 'textScore' } } : sort;

        const query = Car.find(searchQuery, { score: { $meta: 'textScore' } })
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const count = await Car.countDocuments(searchQuery);
        const data = await query.exec();

        return { data, count, page: Math.floor(skip / limit) + 1, pages: Math.ceil(count / limit) };
    }
}

export default new CarRepository();
