import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import FormInput from '../components/FormInput';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cars, setCars] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('inventory');

    const [newCar, setNewCar] = useState({
        brand: '', modelName: '', year: '', price: '',
        color: '', ownerType: '1st Hand', registrationNumber: '', images: '',
        fuelType: 'Petrol',
        fsale_base: '',
        fsale_active: false
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Create admin state
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', phone: '' });
    const [adminMsg, setAdminMsg] = useState('');

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
        fetchCars();
        fetchUsers();
    }, [navigate]);

    const fetchCars = async () => {
        try {
            const res = await api.get('/cars');
            setCars(res.data.data);
        } catch (error) {
            console.error("Failed to load inventory", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users/all');
            setAllUsers(res.data);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    };

    const handleChange = (e) =>
        setNewCar({ ...newCar, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    const handleCreateCar = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let uploadedUrls = [];
            
            // 1. Upload files if any
            if (imageFiles.length > 0) {
                const formData = new FormData();
                imageFiles.forEach(file => formData.append('images', file));
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls = uploadRes.data;
            }

            // 2. Get links from textarea
            const pastedUrls = newCar.images.split(',').map(img => img.trim()).filter(i => i);

            // 3. Combine both
            const finalImages = [...pastedUrls, ...uploadedUrls];

            const payload = {
                ...newCar,
                images: finalImages,
                year: Number(newCar.year),
                price: Number(newCar.price),
                techSpecs: {
                    fuelType: newCar.fuelType
                },
                flashSale: {
                    fsale_base: Number(newCar.fsale_base) || 0,
                    fsale_active: Boolean(newCar.fsale_active)
                }
            };

            await api.post('/cars', payload);
            alert('Car added successfully!');
            fetchCars();

            setNewCar({
                brand: '', modelName: '', year: '', price: '',
                color: '', ownerType: '1st Hand', registrationNumber: '', images: '',
                fuelType: 'Petrol',
                fsale_base: '',
                fsale_active: false
            });
            setImageFiles([]);
            const fileInput = document.getElementById('carFiles');
            if (fileInput) fileInput.value = '';
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Error occurred');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCar = async (id) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            try {
                await api.delete(`/cars/${id}`);
                fetchCars();
            } catch (err) {
                alert('Failed to delete');
            }
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Delete user "${userName}"? This cannot be undone.`)) {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setAdminMsg('');
        try {
            await api.post('/auth/register', { ...newAdmin, role: 'admin' });
            setAdminMsg('✅ Admin account created successfully!');
            setNewAdmin({ name: '', email: '', password: '', phone: '' });
            fetchUsers();
        } catch (err) {
            setAdminMsg(`❌ ${err.response?.data?.message || 'Failed to create admin'}`);
        }
    };

    if (!user) return null;

    const tabStyle = (tab) => ({
        padding: '0.75rem 2rem',
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        borderBottom: activeTab === tab ? '3px solid var(--accent-color)' : '3px solid transparent',
        color: activeTab === tab ? 'var(--accent-color)' : 'var(--text-secondary)',
        fontSize: '1rem',
        fontWeight: activeTab === tab ? 600 : 400,
        transition: 'all 0.3s ease'
    });

    return (
        <div className="page-container">
            <Helmet>
                <title>Admin Dashboard | NewRoyalCars</title>
            </Helmet>

            <h1 style={{ marginBottom: '0.25rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Welcome, Nandu Dhanokar</p>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button style={tabStyle('inventory')} onClick={() => setActiveTab('inventory')}>
                    🚗 Inventory
                </button>
                <button style={tabStyle('addCar')} onClick={() => setActiveTab('addCar')}>
                    ➕ Add Vehicle
                </button>
                <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
                    👥 Users ({allUsers.length})
                </button>
                <button style={tabStyle('createAdmin')} onClick={() => setActiveTab('createAdmin')}>
                    🔐 Create Admin
                </button>
            </div>

            {/* ========== ADD VEHICLE TAB ========== */}
            {activeTab === 'addCar' && (
                <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Add New Vehicle</h3>

                    <form onSubmit={handleCreateCar}>
                        <div className="two-col">
                            <FormInput label="Company (Brand)" name="brand" value={newCar.brand} onChange={handleChange} required />
                            <FormInput label="Model Name" name="modelName" value={newCar.modelName} onChange={handleChange} required />
                            <FormInput 
                                label="Owner" 
                                type="select" 
                                name="ownerType" 
                                value={newCar.ownerType} 
                                onChange={handleChange} 
                                options={['1st Hand', '2nd Hand', '3rd Hand', 'More than 3']} 
                                required 
                            />
                            <FormInput label="Colour" name="color" value={newCar.color} onChange={handleChange} required />
                            <FormInput label="Chassis No" name="registrationNumber" value={newCar.registrationNumber} onChange={handleChange} required />
                            <FormInput 
                                label="Fuel Type" 
                                type="select" 
                                name="fuelType" 
                                value={newCar.fuelType} 
                                onChange={handleChange} 
                                options={['Petrol', 'Diesel', 'Electric', 'Hybrid']} 
                                required 
                            />
                            <FormInput label="Year" type="number" name="year" value={newCar.year} onChange={handleChange} required />
                            <FormInput label="Base Price (₹)" type="number" name="price" value={newCar.price} onChange={handleChange} required />
                            
                            <FormInput label="Flash Sale Price (₹)" type="number" name="fsale_base" value={newCar.fsale_base} onChange={handleChange} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '100%', alignSelf: 'center' }}>
                                <input 
                                    type="checkbox" 
                                    id="fsale_active" 
                                    name="fsale_active" 
                                    checked={newCar.fsale_active} 
                                    onChange={(e) => setNewCar({ ...newCar, fsale_active: e.target.checked })} 
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label htmlFor="fsale_active" style={{ fontWeight: 600 }}>Activate Flash Sale</label>
                            </div>
                            
                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormInput 
                                    label="Image URLs (Paste links here, comma separated)" 
                                    type="textarea" 
                                    name="images" 
                                    value={newCar.images} 
                                    onChange={handleChange} 
                                    placeholder="Paste image links here, separated by commas..."
                                />
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        OR Upload Files from Device
                                    </label>
                                    <input 
                                        id="carFiles"
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
                                    <small style={{ color: 'var(--text-secondary)' }}>You can paste links, upload files, or do both.</small>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ width: '100%', marginTop: '2rem' }}
                            disabled={uploading}
                        >
                            {uploading ? 'Adding Vehicle...' : 'Add Vehicle to Inventory'}
                        </button>
                    </form>
                </div>
            )}

            {/* ========== INVENTORY TAB ========== */}
            {activeTab === 'inventory' && (
                <div className="fade-in">
                    <h3 style={{ marginBottom: '1.5rem' }}>Current Inventory</h3>

                    <div className="glass-panel table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th style={{ padding: '1rem' }}>Vehicle</th>
                                    <th style={{ padding: '1rem' }}>Chassis No</th>
                                    <th style={{ padding: '1rem' }}>Owner</th>
                                    <th style={{ padding: '1rem' }}>Year</th>
                                    <th style={{ padding: '1rem' }}>Price</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cars.map(car => (
                                    <tr key={car._id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            {car.brand} {car.modelName}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{car.registrationNumber || '—'}</td>
                                        <td style={{ padding: '1rem' }}>{car.ownerType || '—'}</td>
                                        <td style={{ padding: '1rem' }}>{car.year}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {car.flashSale?.fsale_active ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                                                        ₹{(car.price || 0).toLocaleString('en-IN')}
                                                    </span>
                                                    <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                                                        ₹{(car.flashSale.fsale_base || 0).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            ) : (
                                                `₹${(car?.price || 0).toLocaleString('en-IN')}`
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button onClick={() => navigate(`/admin/edit/${car._id}`)} className="btn-secondary" style={{ marginRight: '0.5rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteCar(car._id)} className="btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {cars.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No vehicles found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ========== USERS TAB ========== */}
            {activeTab === 'users' && (
                <div className="fade-in">
                    <h3 style={{ marginBottom: '1.5rem' }}>All Registered Users</h3>

                    <div className="glass-panel table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>Phone</th>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Wishlist</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {allUsers.map(u => (
                                    <tr key={u._id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                                        <td style={{ padding: '1rem' }}>{u.phone || '—'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: u.role === 'admin' ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)',
                                                color: u.role === 'admin' ? '#7c3aed' : '#2563eb'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {u.wishlist && u.wishlist.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    {u.wishlist.map(car => (
                                                        <span 
                                                            key={car._id} 
                                                            style={{ 
                                                                fontSize: '0.8rem', 
                                                                padding: '0.15rem 0.4rem', 
                                                                background: 'rgba(37,99,235,0.08)', 
                                                                borderRadius: '4px',
                                                                color: 'var(--accent-color)'
                                                            }}
                                                        >
                                                            {car.brand} {car.modelName} ({car.year})
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {u.role !== 'admin' && (
                                                <button 
                                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                                    className="btn-danger"
                                                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                                                >
                                                    🗑 Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {allUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ========== CREATE ADMIN TAB ========== */}
            {activeTab === 'createAdmin' && (
                <div className="fade-in">
                    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Create Admin Account</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Only existing admins can create new admin accounts.
                        </p>

                        {adminMsg && (
                            <div style={{ 
                                padding: '0.75rem 1rem', 
                                marginBottom: '1rem', 
                                borderRadius: '8px', 
                                background: adminMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: adminMsg.startsWith('✅') ? 'var(--success-color)' : 'var(--error-color)',
                                fontSize: '0.9rem'
                            }}>
                                {adminMsg}
                            </div>
                        )}

                        <form onSubmit={handleCreateAdmin}>
                            <FormInput 
                                label="Full Name" 
                                name="name" 
                                value={newAdmin.name} 
                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} 
                                required 
                            />
                            <FormInput 
                                label="Phone Number" 
                                name="phone" 
                                value={newAdmin.phone} 
                                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })} 
                                required 
                            />
                            <FormInput 
                                label="Email Address" 
                                type="email" 
                                name="email" 
                                value={newAdmin.email} 
                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} 
                                required 
                            />
                            <FormInput 
                                label="Password" 
                                type="password" 
                                name="password" 
                                value={newAdmin.password} 
                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} 
                                required 
                            />
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                                🔐 Create Admin Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;