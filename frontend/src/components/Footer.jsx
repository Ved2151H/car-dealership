import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            padding: '3rem 5%',
            borderTop: '1px solid var(--border-color)',
            marginTop: '4rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
        }}>
            <p>&copy; {new Date().getFullYear()} NewRoyalCars. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
