import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // <-- CSS burada import ediliyor

/* INPUT STYLE */
const inputStyle = {
    width: '100%',
    padding: '0.7rem',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box'
};

const Dashboard = () => {
    const [scanHistory, setScanHistory] = useState([]);

    // MODAL & FORM
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [nfcUid, setNfcUid] = useState('');
    const [isReadingNfc, setIsReadingNfc] = useState(false);

    const navigate = useNavigate();

    /* LOGOUT */
    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    /* HISTORY POLLING */
    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/scan-history');
            if (Array.isArray(res.data)) setScanHistory(res.data);
        } catch (err) {
            console.error('History alınamadı', err);
        }
    };

    /* SIMULATION */
    const handleSimulation = async (nfcData) => {
        try {
            await axios.post('/api/check-nfc', { nfcData });
            fetchHistory();
        } catch {
            alert('Simulyasiya xətası');
        }
    };

    /* NFC READ */
    const handleReadNfc = async () => {
        setIsReadingNfc(true);
        setNfcUid('');

        try {
            await axios.post('/api/nfc/start-wait');

            const interval = setInterval(async () => {
                const res = await axios.get('/api/nfc/latest');
                if (res.data.uid) {
                    setNfcUid(res.data.uid);
                    setIsReadingNfc(false);
                    clearInterval(interval);
                }
            }, 1000);
        } catch {
            setIsReadingNfc(false);
            alert('NFC oxuma başlaya bilmədi.');
        }
    };

    /* SAVE STUDENT */
    const handleSaveStudent = async () => {
        if (!studentName || !nfcUid) return;

        try {
            await axios.post('/api/students', {
                name: studentName,
                nfcUid
            });

            setStudentName('');
            setNfcUid('');
            setShowAddStudent(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Qeydiyyat xətası');
        }
    };

    return (
        <div className="container animate-fade-in">

            {/* NAVBAR */}
            <nav className="nav glass" style={{ padding: '1rem 2rem' }}>
                <div className="logo">NFC İlə Tələbə Sistemi</div>
                <button
                    onClick={handleLogout}
                    className="btn"
                    style={{ background: 'transparent', border: '1px solid var(--text-muted)' }}
                >
                    Çıxış
                </button>
            </nav>

            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* HISTORY */}
                <div className="glass status-card" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <h2 className="sticky-title">Son Oxunan Kartlar</h2>

                    {scanHistory.length === 0 ? (
                        <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                            Hələ kart oxudulmadı...
                        </div>
                    ) : (
                        <div className="history-list">
                            {scanHistory.map((scan, index) => (
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
                                            {new Date(scan.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ALT PANEL */}
                <div className="bottom-panels">

                    {/* SIMULATION */}
                    <div className="glass panel">
                        <h3>🛠 Simulyasiya</h3>
                        <div className="panel-actions">
                            <button className="btn" onClick={() => handleSimulation('0x00 0x00')}>
                                ✅ Düzgün Kart
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'var(--error)' }}
                                onClick={() => handleSimulation('0x99 0x99')}
                            >
                                ❌ Səhv Kart
                            </button>
                        </div>
                    </div>

                    {/* ADD STUDENT */}
                    <div className="glass panel center">
                        <div className="big-plus">➕</div>
                        <h4>Yeni Tələbə</h4>
                        <button className="btn full" onClick={() => setShowAddStudent(true)}>
                            Tələbə əlavə et
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showAddStudent && (
                <div className="modal-backdrop" onClick={() => setShowAddStudent(false)}>
                    <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>➕ Yeni Tələbə</h3>
                        <p className="modal-desc">Ad yaz və NFC kartını oxut</p>

                        <div className="modal-body">
                            <input
                                placeholder="Ad Soyad"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                style={inputStyle}
                            />

                            <button
                                className={`btn full ${isReadingNfc ? 'nfc-reading' : ''}`}
                                onClick={handleReadNfc}
                                disabled={isReadingNfc}
                            >
                                {isReadingNfc ? '📡 NFC gözlənilir...' : '📡 NFC Kart Oxut'}
                            </button>

                            {nfcUid && (
                                <div className="uid-box">
                                    ✅ Oxunan UID: <b>{nfcUid}</b>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    className="btn"
                                    disabled={!studentName || !nfcUid}
                                    onClick={handleSaveStudent}
                                >
                                    💾 Qeyd et
                                </button>
                                <button
                                    className="btn cancel"
                                    onClick={() => setShowAddStudent(false)}
                                >
                                    Ləğv et
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
