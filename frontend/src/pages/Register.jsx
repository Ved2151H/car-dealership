import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import { Helmet } from 'react-helmet-async';

const Register = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/register', user);
            localStorage.setItem('user', JSON.stringify(res.data));
            window.dispatchEvent(new Event('user-auth-change'));
            navigate('/account');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
            <Helmet>
                <title>Register | NewRoyalCars</title>
            </Helmet>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <FormInput 
                        label="Full Name"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        required
                    />
                    <FormInput 
                        label="Phone Number"
                        name="phone"
                        value={user.phone}
                        onChange={handleChange}
                        required
                    />
                    <FormInput 
                        label="Email Address"
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />
                    <FormInput 
                        label="Password"
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Register
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <a href="/login" style={{ color: 'var(--accent-color)' }}>Login here</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
