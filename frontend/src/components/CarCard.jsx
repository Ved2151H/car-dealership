import React from 'react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  return (
    <div
      className="glass-panel fade-in"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',          /* never exceed grid cell */
        minWidth: 0,            /* allow shrinking below content size */
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(59,130,246,0.18)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Image */}
      <div style={{ height: '200px', backgroundColor: 'var(--border-color)', position: 'relative', flexShrink: 0 }}>
        {car?.images?.length > 0 ? (
          <img
            src={car.images[0]}
            alt={car.modelName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            📷 No Image
          </div>
        )}
        {/* Price badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'var(--accent-color)',
          color: 'white',
          padding: '0.2rem 0.65rem',
          borderRadius: '20px',
          fontWeight: 700,
          fontSize: '0.82rem',
          whiteSpace: 'nowrap',
        }}>
          ₹{car?.price?.toLocaleString('en-IN') || 'N/A'}
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '1.1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <h3 style={{ marginBottom: '0.35rem', fontSize: '1.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {car?.brand} {car?.modelName}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {car?.year} • {car?.color} • {car?.ownerType || 'N/A'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
          <Link to={`/car/${car?._id}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
            View
          </Link>
          {isAdmin && (
            <Link to={`/admin/edit/${car?._id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard;
