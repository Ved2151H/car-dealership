import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import CarCard from '../components/CarCard';

const CarInventory = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, count: 0 });
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [brand, setBrand] = useState(searchParams.get('brand') || '');
    const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '');

    const keyword = searchParams.get('keyword') || '';
    const page = searchParams.get('pageNumber') || 1;

    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (keyword) params.append('keyword', keyword);
                if (brand) params.append('brand', brand);
                if (fuelType) params.append('fuelType', fuelType);
                params.append('pageNumber', page);
                const res = await api.get(`/cars?${params.toString()}`);
                setCars(res.data.data);
                setPageInfo({ page: res.data.page, pages: res.data.pages, count: res.data.count });
            } catch (error) {
                console.error("Error fetching inventory", error);
            }
            setLoading(false);
        };
        fetchCars();
    }, [keyword, brand, fuelType, page]);

    const handleFilterChange = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        if (brand) newParams.set('brand', brand); else newParams.delete('brand');
        if (fuelType) newParams.set('fuelType', fuelType); else newParams.delete('fuelType');
        newParams.set('pageNumber', '1');
        setSearchParams(newParams);
        setFiltersOpen(false);
    };

    const filterForm = (
        <form onSubmit={handleFilterChange}>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Brand</label>
                <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    placeholder="e.g. BMW"
                />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fuel Type</label>
                <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                    <option value="">All</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Apply Filters</button>
        </form>
    );

    return (
        <div className="page-container" style={{ paddingBottom: '4rem' }}>
            <Helmet>
                <title>Inventory | NewRoyalCars</title>
            </Helmet>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>Car Inventory</h1>
                    {keyword && <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Results for "{keyword}"</p>}
                </div>
                {/* Mobile filter toggle button */}
                <button
                    className="btn-secondary"
                    onClick={() => setFiltersOpen(prev => !prev)}
                    style={{ display: 'none' }}
                    id="filter-toggle-btn"
                >
                    {filtersOpen ? '✕ Hide Filters' : '⚙️ Filters'}
                </button>
            </div>

            {/* Mobile filter toggle — shown via inline style hack using a CSS class approach */}
            <style>{`
                @media (max-width: 768px) {
                    #filter-toggle-btn { display: inline-flex !important; }
                    .inventory-sidebar { display: ${filtersOpen ? 'block' : 'none'} !important; position: static !important; width: 100% !important; margin-bottom: 1.5rem; }
                    .inventory-layout { flex-direction: column !important; }
                }
            `}</style>

            <div className="inventory-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Sidebar Filters */}
                <div className="inventory-sidebar glass-panel" style={{ padding: '1.5rem', width: '260px', flexShrink: 0, position: 'sticky', top: '80px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>🔍 Filters</h3>
                    {filterForm}
                </div>

                {/* Car Grid */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading Inventory...</div>
                    ) : cars.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</p>
                            <p>No cars match your search.</p>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                Showing {cars.length} vehicle{cars.length !== 1 ? 's' : ''}
                            </p>
                            <div className="grid-auto">
                                {cars.map(car => (
                                    <CarCard key={car._id} car={car} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pageInfo.pages > 1 && (
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), pageNumber: Math.max(1, Number(page) - 1) })}
                                        disabled={page <= 1}
                                        className="btn-secondary"
                                    >← Prev</button>
                                    <span style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Page {page} of {pageInfo.pages}</span>
                                    <button
                                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), pageNumber: Math.min(pageInfo.pages, Number(page) + 1) })}
                                        disabled={page >= pageInfo.pages}
                                        className="btn-secondary"
                                    >Next →</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarInventory;
