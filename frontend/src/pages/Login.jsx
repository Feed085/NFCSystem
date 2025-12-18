import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isStudent, setIsStudent] = useState(false); // Toggle state
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>

            <div className="glass animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>

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

                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {isStudent ? 'Tələbə Girişi' : 'Admin Girişi'}
                </h2>

                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>İstifadəçi Adı</label>
                        <input
                            type="text"
                            name="username"
                            className="input-field"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder={isStudent ? "student_user" : "admin"}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Şifrə</label>
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="***"
                        />
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Giriş
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
