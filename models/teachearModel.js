
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    firstName: {
        type: String,
        set: (entry) => {
            return entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        },
        required: true,
        trim: true
    },
    surnName: {
        type: String,
        set: (entry) => {
            return entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        },
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        set: (entry) => {
            return entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        },
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    phoneNumber: {
        type: String,
        required: true
    },
    maritalStatus: {
        type: String,
        required: true,
        enum: ['married', 'single', 'divorced', 'widow']
    },
    teacherID: {
        type: Number,
        unique: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "school"
    },
    role: { // Role field for teacher or admin
        type: String,
        enum: ['teacher', 'admin'],
        default: 'teacher' // Default to 'teacher'
    },
    teacherProfile:{
        type:String
    }
}, { timestamps: true });

const teacherModel = mongoose.model('teacher', teacherSchema);
module.exports = teacherModel;