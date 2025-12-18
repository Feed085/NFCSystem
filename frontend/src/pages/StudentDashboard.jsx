import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing same styles

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Load user from local storage
        const storedUser = localStorage.getItem('studentUser');
        const token = localStorage.getItem('studentToken');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(storedUser));
        fetchData(token);

        const interval = setInterval(() => fetchData(token), 3000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchData = async (token) => {
        try {
            const res = await axios.get('/api/student/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data.history);
        } catch (err) {
            console.error('Fetch error:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLogout();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentUser');
        navigate('/login');
    };

    if (!user) return <div className="container" style={{ color: 'white' }}>Yüklənir...</div>;

    return (
        <div className="container animate-fade-in">
            {/* NAVBAR */}
            <nav className="nav glass" style={{ padding: '1rem 2rem' }}>
                <div className="logo">Tələbə Paneli</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{user.name}</span>
                    <button
                        onClick={handleLogout}
                        className="btn"
                        style={{ background: 'transparent', border: '1px solid var(--text-muted)' }}
                    >
                        Çıxış
                    </button>
                </div>
            </nav>

            <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>

                {/* INFO CARD */}
                <div className="glass panel">
                    <h3>👤 Mənim Məlumatlarım</h3>
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
                        <div><b>Ad Soyad:</b> {user.name}</div>
                        <div><b>İstifadəçi Adı:</b> {user.username}</div>
                        <div><b>NFC UID:</b> {user.nfcUid}</div>
                    </div>
                </div>

                {/* HISTORY */}
                <div className="glass status-card" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <h2 className="sticky-title">Giriş Tarixçəm</h2>

                    {history.length === 0 ? (
                        <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                            Hələ heç bir giriş qeydə alınmayıb.
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((scan, index) => (
                                <div
                                    key={index}
                                    className="glass history-item"
                                    style={{
                                        borderLeft: `5px solid ${scan.found ? 'var(--primary)' : 'var(--error)'}`
                                    }}
                                >
                                    <div className="history-icon">
                                        {scan.found ? '✅' : '❌'}
                                    </div>
                                    <div>
                                        <div className="history-text">{scan.message}</div>
                                        <div className="history-time">
                                            {new Date(scan.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;
