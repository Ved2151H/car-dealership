import mongoose from 'mongoose';

const techSpecsSchema = new mongoose.Schema({
    engineType: String,
    horsepower: Number,
    mileage: Number,
    transmission: {
        type: String,
        enum: ['Automatic', 'Manual', 'CVT']
    },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
    },
    safetyFeatures: [String], // Array of strings like "ABS", "Airbags"
    comfortFeatures: [String], // Array of strings like "Power Steering", "AC"
    infotainment: [String],
    seatingCapacity: Number,
    insuranceDetails: String,
    serviceHistory: String
}, { _id: false });

const carSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true,
        index: true
    },
    modelName: {
        type: String,
        required: true,
        index: true
    },
    year: {
        type: Number,
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        index: true
    },
    ownerInfo: {
        name: String,
        contact: String
    },
    registrationNumber: {
        type: String,
        unique: true
    },
    ownerType: {
        type: String,
        required: true,
        enum: ['1st Hand', '2nd Hand', '3rd Hand', 'More than 3']
    },
    color: String,
    location: String,
    images: {
        type: [String],
        validate: [arrayLimit, '{PATH} needs at least 4 images']
    },
    techSpecs: techSpecsSchema,
    sellerNotes: String,
    
    // Flash Sale details
    flashSale: {
        fsale_base: { type: Number, default: 0 },
        fsale_active: { type: Boolean, default: false }
    },
    
    // Admin reference
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Custom validator to ensure at least 4 images
function arrayLimit(val) {
    return val.length >= 4;
}

// Add text index for full-text search capabilities
carSchema.index({ brand: 'text', modelName: 'text', sellerNotes: 'text' });

const Car = mongoose.model('Car', carSchema);

export default Car;
