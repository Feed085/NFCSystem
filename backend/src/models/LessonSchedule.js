const mongoose = require('mongoose');

const lessonScheduleSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        unique: true
    },
    startTime: {
        type: String, // HH:mm
        required: true
    },
    endTime: {
        type: String, // HH:mm
        required: true
    }
});

module.exports = mongoose.model('LessonSchedule', lessonScheduleSchema);
