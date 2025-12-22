import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isStudent, setIsStudent] = useState(false); // Toggle state
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isStudent) {
                // Student Login
                const res = await axios.post('/api/student/login', formData);
                if (res.data.success) {
                    localStorage.setItem('studentToken', res.data.token);
                    localStorage.setItem('studentUser', JSON.stringify(res.data.user));
                    navigate('/student/dashboard');
                }
            } else {
                // Admin Login
                const res = await axios.post('/api/login', formData);
                if (res.data.success) {
                    localStorage.setItem('isAuthenticated', 'true');
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Giriş uğursuz. Məlumatları yoxlayın.';
            setError(msg);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>

            {/* Combined Glass Container */}
            <div className="glass animate-fade-in" style={{
                display: 'flex',
                width: '100%',
                maxWidth: '1000px',
                overflow: 'hidden',
                alignItems: 'stretch'
            }}>
                {/* LEFT SIDE - Image */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <img
                        src="/login-bg.png"
                        alt="EduPass"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>

                {/* RIGHT SIDE - Login Form */}
                <div style={{
                    flex: 1,
                    padding: '3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    {/* TOGGLE BUTTONS */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                        <button
                            className={`btn ${!isStudent ? '' : 'cancel'}`}
                            onClick={() => { setIsStudent(false); setError(''); }}
                            style={{ flex: 1, opacity: !isStudent ? 1 : 0.5 }}
                        >
                            Admin
                        </button>
                        <button
                            className={`btn ${isStudent ? '' : 'cancel'}`}
                            onClick={() => { setIsStudent(true); setError(''); }}
                            style={{ flex: 1, opacity: isStudent ? 1 : 0.5 }}
                        >
                            Tələbə
                        </button>
                    </div>

                    <h2 key={isStudent ? 'student' : 'admin'} style={{
                        textAlign: 'center',
                        marginBottom: '2rem',
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                        animation: 'slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        {isStudent ? 'Tələbə Girişi' : 'Admin Girişi'}
                    </h2>

                    {/* Fixed height container for error message to prevent layout shift */}
                    <div style={{ height: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {error && (
                            <div className="animate-fade-in" style={{
                                color: 'var(--error)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                textShadow: '0 0 10px rgba(255, 49, 49, 0.2)'
                            }}>
                                {error}
                            </div>
                        )}
                    </div>

                    <form key={isStudent ? 'student-form' : 'admin-form'} onSubmit={handleSubmit} style={{
                        animation: 'slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '0.3px' }}>İstifadəçi Adı</label>
                            <input
                                type="text"
                                name="username"
                                className="input-field"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder={isStudent ? "İstifadəçi adı" : "İstifadəçi adı"}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '0.3px' }}>Şifrə</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="input-field"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Şifrənizi daxil edin"
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onMouseDown={() => setShowPassword(true)}
                                    onMouseUp={() => setShowPassword(false)}
                                    onMouseLeave={() => setShowPassword(false)}
                                    onTouchStart={() => setShowPassword(true)}
                                    onTouchEnd={() => setShowPassword(false)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.5rem',
                                        top: '38%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.4rem',
                                        color: showPassword ? '#6366f1' : 'rgba(148, 163, 184, 0.7)',
                                        transition: 'color 0.2s',
                                        fontSize: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '2rem',
                                        height: '2rem'
                                    }}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn" style={{ width: '100%' }}>
                            Giriş
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
