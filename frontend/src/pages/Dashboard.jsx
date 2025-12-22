import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [scanHistory, setScanHistory] = useState([]);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showDeleteStudent, setShowDeleteStudent] = useState(false);

    const getLocalDate = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };

    const [lessonStartTime, setLessonStartTime] = useState('09:00');
    const [lessonEndTime, setLessonEndTime] = useState('10:00');
    const [dailyAttendance, setDailyAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(getLocalDate());

    useEffect(() => {
        const interval = setInterval(() => {
            const current = getLocalDate();
            if (current !== selectedDate) setSelectedDate(current);
        }, 60000);
        return () => clearInterval(interval);
    }, [selectedDate]);

    const [settingsDate, setSettingsDate] = useState('');
    const [isCustomSchedule, setIsCustomSchedule] = useState(false);

    const [studentName, setStudentName] = useState('');
    const [courseGroup, setCourseGroup] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nfcUid, setNfcUid] = useState('');
    const [isReadingNfc, setIsReadingNfc] = useState(false);

    const navigate = useNavigate();
    const [nfcMode, setNfcMode] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`/api/settings/schedule?date=${settingsDate}`);
                setLessonStartTime(res.data.lessonStartTime || res.data.startTime || '09:00');
                setLessonEndTime(res.data.lessonEndTime || res.data.endTime || '10:00');
                setIsCustomSchedule(!!res.data.isCustom);
            } catch {}
        };
        fetchSettings();
    }, [settingsDate]);

    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                const res = await axios.get('/api/scan-history');
                if (Array.isArray(res.data)) setScanHistory(res.data);
            } catch {}
        };

        fetchLiveData();
        const interval = setInterval(fetchLiveData, 3000);
        return () => clearInterval(interval);
    }, []);

    const startNfcRead = async () => {
        if (isReadingNfc) {
            await axios.post('/api/nfc/cancel');
            setIsReadingNfc(false);
            setNfcUid('');
            return;
        }

        try {
            setIsReadingNfc(true);
            setNfcUid('');
            const endpoint = nfcMode === 'add' ? '/api/nfc/start-wait' : '/api/nfc/start-delete';
            await axios.post(endpoint);

            const poll = setInterval(async () => {
                const res = await axios.get('/api/nfc/latest');
                if (res.data.uid) {
                    setNfcUid(res.data.uid);
                    setIsReadingNfc(false);
                    clearInterval(poll);
                }
            }, 1000);
        } catch {
            setIsReadingNfc(false);
        }
    };

    const handleSaveStudent = async () => {
        await axios.post('/api/students', { name: studentName, courseGroup, username, password, nfcUid });
        setShowAddStudent(false);
    };

    const handleDeleteStudent = async () => {
        await axios.post('/api/students/delete', { nfcUid });
        setShowDeleteStudent(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    return (
        <div className="container">

            {/* ADD STUDENT MODAL */}
            {showAddStudent && (
                <div
                    className="modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 1000,
                        overflowY: 'auto',          // ✅ ARKA PLAN SCROLL
                        padding: '4rem 0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}
                >
                    <div
                        className="glass"
                        style={{
                            width: '500px',
                            maxHeight: '85vh',        // ✅ MODAL SINIRI
                            overflowY: 'auto',        // ✅ MODAL İÇİ SCROLL
                            padding: '3rem',
                            background: 'var(--bg-dark)',
                            border: '1px solid var(--primary)',
                            boxShadow: '0 0 50px rgba(0, 243, 255, 0.2)'
                        }}
                    >
                        {/* içerik AYNI */}
                    </div>
                </div>
            )}

            {/* DELETE STUDENT MODAL */}
            {showDeleteStudent && (
                <div
                    className="modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 1000,
                        overflowY: 'auto',          // ✅ ARKA PLAN SCROLL
                        padding: '4rem 0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}
                >
                    <div
                        className="glass"
                        style={{
                            width: '500px',
                            maxHeight: '85vh',        // ✅ MODAL SINIRI
                            overflowY: 'auto',        // ✅ MODAL İÇİ SCROLL
                            padding: '3rem',
                            background: 'var(--bg-dark)',
                            border: '1px solid var(--error)',
                            boxShadow: '0 0 50px rgba(255, 49, 49, 0.2)'
                        }}
                    >
                        {/* içerik AYNI */}
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
