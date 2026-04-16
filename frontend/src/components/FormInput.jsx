import React from 'react';

const FormInput = ({ label, type = "text", name, value, onChange, placeholder, required = false, options = [] }) => {
    return (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={name} style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {label} {required && <span style={{ color: 'var(--error-color)' }}>*</span>}
            </label>
            {type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        minHeight: '100px',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
            ) : type === 'select' ? (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                    <option value="" disabled>Select {label}</option>
                    {options && options.map((opt) => (
                        <option key={opt.value || opt} value={opt.value || opt}>
                            {opt.label || opt}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
            )}
        </div>
    );
};

export default FormInput;
