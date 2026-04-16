import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import CarCard from '../components/CarCard';

const Account = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', phone: '' });
    const [editMsg, setEditMsg] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setUserProfile(res.data);
                setEditData({ name: res.data.name, phone: res.data.phone || '' });
            } catch (error) {
                console.error("Failed to load profile", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleSaveProfile = async () => {
        setEditMsg('');
        try {
            const res = await api.put('/users/profile', editData);
            setUserProfile(prev => ({ ...prev, name: res.data.name, phone: res.data.phone }));
            const stored = JSON.parse(localStorage.getItem('user'));
            stored.name = res.data.name;
            localStorage.setItem('user', JSON.stringify(stored));
            window.dispatchEvent(new Event('user-auth-change'));
            setIsEditing(false);
            setEditMsg('Profile updated!');
        } catch (err) {
            setEditMsg(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you SURE you want to delete your account? This action cannot be undone.")) {
            try {
                await api.delete('/users/profile');
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('user-auth-change'));
                alert("Account deleted successfully.");
                navigate('/');
            } catch (error) {
                alert(error.response?.data?.message || "Failed to delete account");
            }
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.6rem 0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        marginTop: '0.25rem'
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Account Details...</div>;
    if (!userProfile) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--error-color)' }}>Failed to load profile</h2>
            <p>Please try refreshing the page or logging in again.</p>
        </div>
    );

    return (
        <div style={{ padding: '2rem 5%', display: 'flex', gap: '2rem', flexDirection: 'column' }}>
            <Helmet>
                <title>My Account | NewRoyalCars</title>
            </Helmet>

            <h1 style={{ fontSize: '2.5rem' }}>My Account</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '2rem' }}>
                {/* Left Col: Profile & Admin Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Profile Card */}
                    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'var(--accent-color)' }}>Profile Information</h3>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                    ✏️ Edit
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Save</button>
                                    <button onClick={() => { setIsEditing(false); setEditData({ name: userProfile.name, phone: userProfile.phone || '' }); }} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Cancel</button>
                                </div>
                            )}
                        </div>
                        
                        {editMsg && <p style={{ marginBottom: '1rem', color: 'var(--success-color)', fontSize: '0.85rem' }}>{editMsg}</p>}

                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Name</label>
                                    <input style={inputStyle} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Phone</label>
                                    <input style={inputStyle} value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email</label>
                                    <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={userProfile.email} disabled />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email cannot be changed</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p style={{ marginBottom: '0.8rem' }}><strong>Name:</strong> {userProfile.name}</p>
                                <p style={{ marginBottom: '0.8rem' }}><strong>Email:</strong> {userProfile.email}</p>
                                <p style={{ marginBottom: '0.8rem' }}><strong>Phone:</strong> {userProfile.phone || 'Not set'}</p>
                                <p style={{ marginBottom: '0.8rem' }}><strong>Role:</strong> {userProfile.role}</p>
                            </>
                        )}

                        <button onClick={handleDeleteAccount} className="btn-danger" style={{ marginTop: '2rem', width: '100%' }}>
                            Delete Account
                        </button>
                    </div>

                    {/* Contact Admin Card */}
                    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Contact Admin</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Need help? Contact our dealership administration:
                        </p>
                        <p style={{ marginBottom: '0.5rem' }}>👤 Nandu Dhanokar</p>
                        <div style={{ 
                            background: 'var(--accent-color)', 
                            color: 'white', 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            textAlign: 'center', 
                            fontSize: '1.4rem', 
                            fontWeight: 700, 
                            marginBottom: '0.75rem',
                            letterSpacing: '1px'
                        }}>
                            📞 9022042240
                        </div>
                        <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>📧 admin@newroyalcars.com</p>
                        <p style={{ color: 'var(--text-secondary)' }}>📍 NewRoyalCars Dealership</p>
                    </div>
                </div>

                {/* Right Col: Wishlist */}
                <div className="glass-panel fade-in" style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>My Wishlist</h3>
                    
                    {userProfile.wishlist && userProfile.wishlist.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {userProfile.wishlist.map(car => (
                                <CarCard key={car._id} car={car} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
                            <p>You haven't added any cars to your wishlist yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Account;
