import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    /* ===================== STATE ===================== */
    const [scanHistory, setScanHistory] = useState([]);

    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showDeleteStudent, setShowDeleteStudent] = useState(false);

    const [studentName, setStudentName] = useState("");
    const [courseGroup, setCourseGroup] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [nfcUid, setNfcUid] = useState("");
    const [isReadingNfc, setIsReadingNfc] = useState(false);
    const [nfcMode, setNfcMode] = useState(null); // add | delete

    /* ===================== EFFECTS ===================== */

    // Scan history live
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get("/api/scan-history");
                if (Array.isArray(res.data)) setScanHistory(res.data);
            } catch {}
        };

        fetchHistory();
        const i = setInterval(fetchHistory, 3000);
        return () => clearInterval(i);
    }, []);

    /* ===================== NFC ===================== */

    const startNfcRead = async () => {
        // STOP
        if (isReadingNfc) {
            try {
                await axios.post("/api/nfc/cancel");
            } catch {}
            setIsReadingNfc(false);
            return;
        }

        try {
            setIsReadingNfc(true);
            setNfcUid("");

            const endpoint =
                nfcMode === "delete"
                    ? "/api/nfc/start-delete"
                    : "/api/nfc/start-wait";

            await axios.post(endpoint);

            const poll = setInterval(async () => {
                try {
                    if (!isReadingNfc) {
                        clearInterval(poll);
                        return;
                    }

                    const res = await axios.get("/api/nfc/latest");
                    if (res.data?.uid) {
                        setNfcUid(res.data.uid);
                        setIsReadingNfc(false);
                        clearInterval(poll);
                    }
                } catch {}
            }, 1000);
        } catch {
            setIsReadingNfc(false);
            alert("NFC başlatmaq mümkün olmadı");
        }
    };

    /* ===================== ACTIONS ===================== */

    const resetForm = () => {
        setStudentName("");
        setCourseGroup("");
        setUsername("");
        setPassword("");
        setNfcUid("");
        setIsReadingNfc(false);
        setNfcMode(null);
    };

    const handleSaveStudent = async () => {
        if (!studentName || !username || !password || !nfcUid) {
            return alert("Bütün sahələri doldurun");
        }

        try {
            await axios.post("/api/students", {
                name: studentName,
                courseGroup,
                username,
                password,
                nfcUid,
            });
            setShowAddStudent(false);
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || "Xəta baş verdi");
        }
    };

    const handleDeleteStudent = async () => {
        if (!nfcUid) return alert("NFC oxudulmayıb");

        try {
            await axios.post("/api/students/delete", { nfcUid });
            setShowDeleteStudent(false);
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || "Silinmədi");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        navigate("/login");
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="container">

            {/* ===== NAVBAR ===== */}
            <nav className="glass" style={{ padding: "1.2rem 2rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between" }}>
                <b>EduPass</b>
                <button className="btn" onClick={handleLogout}>Çıxış</button>
            </nav>

            {/* ===== ACTIONS ===== */}
            <div className="glass" style={{ padding: "2rem", marginBottom: "2rem" }}>
                <h3>👥 İdarəetmə</h3>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                        className="btn full"
                        onClick={() => {
                            resetForm();
                            setNfcMode("add");
                            setShowAddStudent(true);
                        }}
                    >
                        ➕ Tələbə Əlavə Et
                    </button>

                    <button
                        className="btn full"
                        style={{ background: "var(--error)" }}
                        onClick={() => {
                            resetForm();
                            setNfcMode("delete");
                            setShowDeleteStudent(true);
                        }}
                    >
                        🗑️ Tələbə Sil
                    </button>
                </div>
            </div>

            {/* ===== HISTORY ===== */}
            <div className="glass" style={{ padding: "2rem" }}>
                <h3 className="sticky-title">Son Oxunan Kartlar</h3>
                <div className="history-list">
                    {scanHistory.length === 0 && (
                        <div style={{ opacity: 0.4 }}>Hələ məlumat yoxdur</div>
                    )}

                    {scanHistory.map((h, i) => (
                        <div key={i} className="history-item">
                            <div className="history-icon">
                                {h.found ? "✅" : "❌"}
                            </div>
                            <div>
                                <div className="history-text">{h.message}</div>
                                <div className="history-time">
                                    {h.uid} • {new Date(h.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= ADD MODAL ================= */}
            {showAddStudent && (
                <div className="modal-backdrop">
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <h2>➕ Yeni Tələbə</h2>
                        <p className="modal-desc">Məlumatları doldur və NFC oxut</p>

                        <div className="modal-body">
                            <input className="input-field" placeholder="Ad Soyad" value={studentName} onChange={e => setStudentName(e.target.value)} />
                            <input className="input-field" placeholder="Qrup / Kurs" value={courseGroup} onChange={e => setCourseGroup(e.target.value)} />
                            <input className="input-field" placeholder="İstifadəçi adı" value={username} onChange={e => setUsername(e.target.value)} />
                            <input className="input-field" type="password" placeholder="Şifrə" value={password} onChange={e => setPassword(e.target.value)} />

                            <button
                                className={`btn ${isReadingNfc ? "nfc-reading" : ""}`}
                                onClick={startNfcRead}
                            >
                                {isReadingNfc ? "🛑 DURDUR" : "📡 NFC Oxut"}
                            </button>

                            {nfcUid && <div className="uid-box">✅ {nfcUid}</div>}

                            <div className="modal-actions">
                                <button className="btn" onClick={handleSaveStudent}>Yadda Saxla</button>
                                <button className="btn cancel" onClick={() => setShowAddStudent(false)}>Ləğv</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= DELETE MODAL ================= */}
            {showDeleteStudent && (
                <div className="modal-backdrop">
                    <div className="modal-panel" onClick={e => e.stopPropagation()}>
                        <h2>🗑️ Tələbə Sil</h2>
                        <p className="modal-desc">NFC kartını oxut</p>

                        <div className="modal-body">
                            <button
                                className={`btn ${isReadingNfc ? "nfc-reading" : ""}`}
                                style={{ background: "var(--error)" }}
                                onClick={startNfcRead}
                            >
                                {isReadingNfc ? "🛑 DURDUR" : "📡 NFC Oxut"}
                            </button>

                            {nfcUid && <div className="uid-box">❌ {nfcUid}</div>}

                            <div className="modal-actions">
                                <button className="btn" style={{ background: "var(--error)" }} onClick={handleDeleteStudent}>
                                    Sil
                                </button>
                                <button className="btn cancel" onClick={() => setShowDeleteStudent(false)}>
                                    Ləğv
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
