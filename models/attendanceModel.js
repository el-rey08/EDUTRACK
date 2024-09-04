const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    students: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late'],
            required: true
        },
        checkInTime: {
            type: Date,
            required: false
        },
        checkOutTime: {
            type: Date,
            required: false
        }
    }],
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

const attendanceModel = mongoose.model('Attendance', attendanceSchema);

module.exports = attendanceModel;
