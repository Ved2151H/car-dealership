import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import { Helmet } from 'react-helmet-async';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', credentials);

            // Store user details in localStorage (not tokens, tokens are in cookies)
            localStorage.setItem('user', JSON.stringify(res.data));
            window.dispatchEvent(new Event('user-auth-change'));

            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/account');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
            <Helmet>
                <title>Login | NewRoyalCars</title>
            </Helmet>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
                {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />
                    <FormInput
                        label="Password"
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Login
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--accent-color)' }}>Register here</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
