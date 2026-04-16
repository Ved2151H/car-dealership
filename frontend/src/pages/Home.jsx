import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CarCard from '../components/CarCard';

const Home = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredCars, setFeaturedCars] = useState([]);

    useEffect(() => {
        // Fetch featured or newly added cars
        const fetchCars = async () => {
            try {
                // Fetch first 4 cars sorted by newest
                const res = await api.get('/cars?sort=newest&limit=4');
                setFeaturedCars(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch featured cars", error);
            }
        };
        fetchCars();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/inventory?keyword=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <Helmet>
                <title>NewRoyalCars | Luxury Car Dealership</title>
                <meta name="description" content="Discover and purchase luxury vehicles with ease. Best prices, secure transactions." />
            </Helmet>

            {/* Hero Section */}
            <section style={{
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2rem 5%',
                background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, var(--bg-dark) 70%)'
            }}>
                <h1 className="heading-gradient fade-in" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '1rem' }}>
                    Find Your Perfect Drive
                </h1>
                <p className="fade-in" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2.5rem' }}>
                    Explore our curated collection of premium vehicles tailored to elevate your journey.
                </p>

                <form onSubmit={handleSearch} className="fade-in glass-panel" style={{
                    display: 'flex', width: '100%', maxWidth: '600px', padding: '0.5rem', borderRadius: '50px'
                }}>
                    <input
                        type="text"
                        placeholder="Search by brand, model, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                            color: 'var(--text-primary)', padding: '0.5rem 1rem', fontSize: '1rem'
                        }}
                    />
                    <button type="submit" className="btn-primary" style={{ borderRadius: '40px', flexShrink: 0 }}>Search</button>
                </form>
            </section>

            {/* Featured Section */}
            <section style={{ padding: '4rem 5%' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Featured Inventory</h2>
                <div className="grid-auto">
                    {featuredCars.map(car => (
                        <CarCard key={car._id} car={car} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
