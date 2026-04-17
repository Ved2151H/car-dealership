import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('specs');
    const [activeImage, setActiveImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [showContact, setShowContact] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const res = await api.get(`/cars/${id}`);
                setCar(res.data);
            } catch (error) {
                console.error("Failed to fetch car details", error);
            }
            setLoading(false);
        };
        fetchCar();
    }, [id]);

    // Check if this car is already in the user's wishlist
    useEffect(() => {
        if (!user) return;
        const checkWishlist = async () => {
            try {
                const res = await api.get('/users/profile');
                const wishlistIds = res.data.wishlist?.map(item =>
                    typeof item === 'object' ? item._id : item
                ) || [];
                setIsWishlisted(wishlistIds.includes(id));
            } catch (err) {
                // silently fail – user just won't see pre-filled heart
            }
        };
        checkWishlist();
    }, [id]);

    const handleWishlistToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setWishlistLoading(true);
        try {
            if (isWishlisted) {
                await api.delete(`/users/wishlist/${id}`);
                setIsWishlisted(false);
            } else {
                await api.post('/users/wishlist', { carId: id });
                setIsWishlisted(true);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Wishlist update failed');
        } finally {
            setWishlistLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Details...</div>;
    if (!car) return <div style={{ padding: '4rem', textAlign: 'center' }}>Car NOT FOUND.</div>;

    return (
        <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <Helmet>
                <title>{car.brand} {car.modelName} | NewRoyalCars</title>
                <meta name="description" content={`Buy the ${car.year} ${car.brand} ${car.modelName} at NewRoyalCars.`} />
            </Helmet>

            <div className="details-grid">
                
                {/* Left: Image Gallery */}
                <div className="fade-in">
                    <div className="glass-panel" style={{ height: 'clamp(260px, 45vw, 500px)', padding: '1rem', marginBottom: '1rem', overflow: 'hidden' }}>
                        {car.images?.length > 0 ? (
                            <img 
                                src={car.images[activeImage]} 
                                alt={`${car.brand} ${car.modelName}`} 
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                            />
                        ) : (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                        )}
                    </div>
                    {/* Thumbnail Strip */}
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                        {car.images?.map((img, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setActiveImage(idx)}
                                style={{
                                    width: '100px', height: '70px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                                    border: activeImage === idx ? '2px solid var(--accent-color)' : '2px solid transparent',
                                    opacity: activeImage === idx ? 1 : 0.6,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <img src={img} alt="thumbnail" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Essential Details & Buy Card */}
                <div className="fade-in glass-panel" style={{ padding: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{car.brand} {car.modelName}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                        {car.year} • {car.color} • {car.ownerType}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                            ₹{(car?.flashSale?.fsale_active ? car.flashSale.fsale_base : car.price)?.toLocaleString('en-IN')}
                        </div>
                        {car?.flashSale?.fsale_active && (
                            <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                                ₹{car.price?.toLocaleString('en-IN')}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button 
                            onClick={() => setShowContact(!showContact)}
                            className="btn-primary" 
                            style={{ flex: 1, padding: '1rem' }}
                        >
                            {showContact ? '✕ Close' : '📞 Contact Seller'}
                        </button>
                        <button 
                            onClick={handleWishlistToggle}
                            disabled={wishlistLoading}
                            className="btn-secondary" 
                            style={{ 
                                padding: '1rem', 
                                color: isWishlisted ? '#ff4d6d' : undefined,
                                borderColor: isWishlisted ? '#ff4d6d' : undefined,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {wishlistLoading ? '...' : isWishlisted ? '❤️ Wishlisted' : '♡ Wishlist'}
                        </button>
                    </div>

                    {/* Contact Seller Panel */}
                    {showContact && (
                        <div className="fade-in" style={{ 
                            border: '2px solid var(--accent-color)', 
                            borderRadius: '12px', 
                            padding: '1.5rem', 
                            marginBottom: '1.5rem',
                            background: 'var(--input-bg)'
                        }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Seller Contact Details</h3>
                            <p style={{ marginBottom: '0.75rem', fontWeight: 500 }}>👤 Nandu Dhanokar</p>
                            <a 
                                href="tel:9022042240" 
                                style={{ 
                                    display: 'block',
                                    background: 'var(--accent-color)', 
                                    color: 'white', 
                                    padding: '1rem', 
                                    borderRadius: '8px', 
                                    textAlign: 'center', 
                                    fontSize: '1.5rem', 
                                    fontWeight: 700,
                                    marginBottom: '1rem',
                                    letterSpacing: '2px',
                                    textDecoration: 'none'
                                }}
                            >
                                📞 9022042240
                            </a>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>📧 admin@newroyalcars.com</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>📍 NewRoyalCars Dealership</p>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Vehicle Information</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Chassis No:</strong> {car.registrationNumber || 'N/A'}</p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}><strong>Seller:</strong> {car.createdBy?.name || 'Admin'}</p>
                    </div>
                </div>
            </div>

            {/* Bottom: Tabs for Technical Specs */}
            <div className="fade-in glass-panel" style={{ marginTop: '4rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                    <button 
                        style={{ padding: '1.5rem 2rem', borderBottom: '2px solid var(--accent-color)', color: 'var(--accent-color)', fontWeight: 600 }}
                    >Technical Specifications</button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                        <p><strong style={{ color: 'var(--text-primary)' }}>Company:</strong> {car.brand || 'N/A'}</p>
                        <p><strong style={{ color: 'var(--text-primary)' }}>Model Name:</strong> {car.modelName || 'N/A'}</p>
                        <p><strong style={{ color: 'var(--text-primary)' }}>Owner:</strong> {car.ownerType || 'N/A'}</p>
                        <p><strong style={{ color: 'var(--text-primary)' }}>Colour:</strong> {car.color || 'N/A'}</p>
                        <p><strong style={{ color: 'var(--text-primary)' }}>Chassis No:</strong> {car?.registrationNumber || '—'}</p>
                        <p><strong style={{ color: 'var(--text-primary)' }}>Fuel Type:</strong> {car?.techSpecs?.fuelType || '—'}</p>
                        <p><strong style={{ color: 'var(--text-primary)' }}>Year:</strong> {car?.year || '—'}</p>
                        <p><strong style={{ color: 'var(--text-primary)' }}>Price:</strong> ₹{(car?.flashSale?.fsale_active ? car.flashSale.fsale_base : car?.price)?.toLocaleString('en-IN') || '—'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarDetails;
