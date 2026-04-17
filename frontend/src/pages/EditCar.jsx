import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import FormInput from '../components/FormInput';

const EditCar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [car, setCar] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== 'admin') {
            navigate('/');
            return;
        }
        setUser(parsed);
        fetchCar();
    }, [navigate, id]);

    const fetchCar = async () => {
        try {
            const res = await api.get(`/cars/${id}`);
            const data = res.data;
            setCar({ 
                brand: data.brand || '',
                modelName: data.modelName || '',
                ownerType: data.ownerType || '1st Hand',
                color: data.color || '',
                registrationNumber: data.registrationNumber || '',
                year: data.year || '',
                price: data.price || '',
                fuelType: data.techSpecs?.fuelType || 'Petrol',
                imagesStr: data.images ? data.images.join(', ') : '',
                fsale_base: data.flashSale?.fsale_base || '',
                fsale_active: data.flashSale?.fsale_active || false
            });
        } catch (error) {
            console.error("Failed to load car details", error);
            alert("Failed to load car details");
            navigate('/admin');
        }
    };

    const handleChange = (e) => setCar({ ...car, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    const handleUpdateCar = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let uploadedUrls = [];
            
            // 1. Upload new files if any
            if (imageFiles.length > 0) {
                const formData = new FormData();
                imageFiles.forEach(file => formData.append('images', file));
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls = uploadRes.data;
            }

            // 2. Get links from textarea
            const currentLinks = car.imagesStr ? car.imagesStr.split(',').map(img => img.trim()).filter(i => i) : [];

            // 3. Combine both
            const finalImages = [...currentLinks, ...uploadedUrls];

            const payload = {
                brand: car.brand,
                modelName: car.modelName,
                ownerType: car.ownerType,
                color: car.color,
                registrationNumber: car.registrationNumber,
                year: Number(car.year),
                price: Number(car.price),
                images: finalImages,
                techSpecs: {
                    fuelType: car.fuelType
                },
                flashSale: {
                    fsale_base: Number(car.fsale_base) || 0,
                    fsale_active: Boolean(car.fsale_active)
                }
            };
            
            await api.put(`/cars/${id}`, payload);
            alert('Car updated successfully!');
            navigate('/admin');
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Error occurred');
        } finally {
            setUploading(false);
        }
    };

    if (!user || !car) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem 5%', display: 'flex', justifyContent: 'center' }}>
            <Helmet>
                <title>Edit Car | NewRoyalCars</title>
            </Helmet>
            
            <div className="glass-panel fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '800px' }}>
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Modify Vehicle</h3>
                <form onSubmit={handleUpdateCar}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormInput label="Company (Brand)" name="brand" value={car.brand} onChange={handleChange} required />
                        <FormInput label="Model Name" name="modelName" value={car.modelName} onChange={handleChange} required />
                        <FormInput 
                            label="Owner" 
                            type="select" 
                            name="ownerType" 
                            value={car.ownerType} 
                            onChange={handleChange} 
                            options={['1st Hand', '2nd Hand', '3rd Hand', 'More than 3']} 
                            required 
                        />
                        <FormInput label="Colour" name="color" value={car.color} onChange={handleChange} required />
                        <FormInput label="Chassis No" name="registrationNumber" value={car.registrationNumber} onChange={handleChange} required />
                        <FormInput 
                            label="Fuel Type" 
                            type="select" 
                            name="fuelType" 
                            value={car.fuelType} 
                            onChange={handleChange} 
                            options={['Petrol', 'Diesel', 'Electric', 'Hybrid']} 
                            required 
                        />
                        <FormInput label="Year" type="number" name="year" value={car.year} onChange={handleChange} required />
                        <FormInput label="Price (₹)" type="number" name="price" value={car.price} onChange={handleChange} required />
                        
                        <FormInput label="Flash Sale Price (₹)" type="number" name="fsale_base" value={car.fsale_base} onChange={handleChange} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '100%', alignSelf: 'center' }}>
                            <input 
                                type="checkbox" 
                                id="fsale_active" 
                                name="fsale_active" 
                                checked={car.fsale_active} 
                                onChange={(e) => setCar({ ...car, fsale_active: e.target.checked })} 
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="fsale_active" style={{ fontWeight: 600 }}>Activate Flash Sale</label>
                        </div>
                        
                        <div style={{ gridColumn: 'span 2' }}>
                            <FormInput 
                                label="Image URLs (Paste links here, comma separated)" 
                                type="textarea" 
                                name="imagesStr" 
                                value={car.imagesStr || ''} 
                                onChange={handleChange} 
                                placeholder="Paste image links here..."
                            />
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Add More Photos from Device
                                </label>
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--input-bg)'
                                    }}
                                />
                                <small style={{ color: 'var(--text-secondary)' }}>New uploads will be added to the existing links.</small>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={uploading}>
                            {uploading ? 'Updating...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin')} className="btn-secondary" style={{ flex: 1 }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCar;
