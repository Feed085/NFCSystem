require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= DB BAGLANTI ================= */
const FORCE_OFFLINE = false;

if (!FORCE_OFFLINE) {
    mongoose.connect(
        'mongodb://nfcuser:StrongPassword123@127.0.0.1:27017/nfcAttendanceDB?authSource=nfcAttendanceDB'
    ).then(() => {
        console.log('MongoDB qoşuldu');
    }).catch(() => {
        console.log('MongoDB xətası – Offline moda keçildi');
    });
} else {
    console.log('OFFLINE MOD AKTİV');
}

/* ================= LOGIN ================= */
const ADMIN_USER = { username: 'elxan', password: '1234' };

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

/* ================= NFC CHECK ================= */
let scanHistory = [];

app.post('/api/check-nfc', async (req, res) => {
    const { nfcData } = req.body;
    if (!nfcData) return res.status(400).json({ found: false });

    let responseData;

    // OFFLINE
    if (mongoose.connection.readyState !== 1) {
        if (nfcData === "0x00 0x00") {
            responseData = {
                found: true,
                name: "Elxan Kerimov",
                timestamp: new Date()
            };
        } else {
            responseData = {
                found: false,
                name: null,
                timestamp: new Date()
            };
        }
    }
    // ONLINE
    else {
        try {
            const student = await Student.findOne({ nfcData });
            if (student) {
                responseData = {
                    found: true,
                    name: student.name,
                    timestamp: new Date()
                };
            } else {
                responseData = {
                    found: false,
                    name: null,
                    timestamp: new Date()
                };
            }
        } catch (err) {
            return res.status(500).json({ found: false });
        }
    }

    scanHistory.unshift(responseData);
    if (scanHistory.length > 50) scanHistory.pop();

    res.json(responseData);
});

/* ================= HISTORY ================= */
app.get('/api/scan-history', (req, res) => {
    res.json(scanHistory);
});

/* ================= SERVER ================= */
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda işləyir`);
});
