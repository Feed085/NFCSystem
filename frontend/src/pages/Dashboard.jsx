import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [scanHistory, setScanHistory] = useState([]);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showDeleteStudent, setShowDeleteStudent] = useState(false);

    const [studentName, setStudentName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nfcUid, setNfcUid] = useState('');
    const [isReadingNfc, setIsReadingNfc] = useState(false);

    const navigate = useNavigate();

    /* ================= HISTORY ================= */
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/scan-history');
                setScanHistory(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 3000);
        return () => clearInterval(interval);
    }, []);

    /* ================= NFC POLLING ================= */
    const pollNfcUid = async () => {
        try {
            const res = await axios.get('/api/nfc/latest');
            if (res.data?.uid) {
                setNfcUid(res.data.uid);
                setIsReadingNfc(false);
                return true;
            }
        } catch {}
        return false;
    };

    const startNfcRead = async (mode) => {
        setIsReadingNfc(true);
        setNfcUid('');

        await axios.post(
            mode === 'add'
                ? '/api/nfc/start-wait'
                : '/api/nfc/start-delete'
        );

        const interval = setInterval(async () => {
            const done = await pollNfcUid();
            if (done) clearInterval(interval);
        }, 1000);

        setTimeout(() => {
            clearInterval(interval);
            setIsReadingNfc(false);
        }, 10000);
    };

    /* ================= ADD STUDENT ================= */
    const handleSaveStudent = async () => {
        if (!studentName || !username || !password || !nfcUid)
            return alert('Bütün xanaları doldurun');

        try {
            await axios.post('/api/students', {
                name: studentName,
                username,
                password,
                nfcUid
            });
            resetForm();
            setShowAddStudent(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Xəta baş verdi');
        }
    };

    /* ================= DELETE STUDENT ================= */
    const handleDeleteStudent = async () => {
        if (!nfcUid) return;

        try {
            await axios.post('/api/students/delete', { nfcUid });
            resetForm();
            setShowDeleteStudent(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Silinmə xətası');
        }
    };

    const resetForm = () => {
        setStudentName('');
        setUsername('');
        setPassword('');
        setNfcUid('');
        setIsReadingNfc(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="container">
            <h1>Admin Dashboard</h1>

            <button onClick={() => setShowAddStudent(true)}>➕ Tələbə Əlavə Et</button>
            <button onClick={() => setShowDeleteStudent(true)}>🗑️ Tələbə Sil</button>
            <button onClick={handleLogout}>Çıxış</button>

            <h3>Son Oxunmalar</h3>
            {scanHistory.map((s, i) => (
                <div key={i}>
                    {s.message} — {s.uid}
                </div>
            ))}

            {showAddStudent && (
                <div>
                    <h3>Yeni Tələbə</h3>
                    <input placeholder="Ad" value={studentName} onChange={e => setStudentName(e.target.value)} />
                    <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" placeholder="Şifrə" value={password} onChange={e => setPassword(e.target.value)} />
                    <button onClick={() => startNfcRead('add')}>
                        {isReadingNfc ? 'NFC Gözlənilir...' : 'NFC Oxut'}
                    </button>
                    {nfcUid && <p>UID: {nfcUid}</p>}
                    <button onClick={handleSaveStudent}>Yadda Saxla</button>
                    <button onClick={() => setShowAddStudent(false)}>Ləğv</button>
                </div>
            )}

            {showDeleteStudent && (
                <div>
                    <h3>Tələbə Sil</h3>
                    <button onClick={() => startNfcRead('delete')}>
                        {isReadingNfc ? 'NFC Gözlənilir...' : 'NFC Oxut'}
                    </button>
                    {nfcUid && <p>UID: {nfcUid}</p>}
                    <button onClick={handleDeleteStudent}>Sil</button>
                    <button onClick={() => setShowDeleteStudent(false)}>Ləğv</button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
