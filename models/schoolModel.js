
const mongoose = require('mongoose');
const schoolSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true,
        trim: true
    },
    schoolAddress: {
        type: String,
        required: true,
    },
    schoolEmail: {
        type: String,
        required: true,
        unique: true
    },
    schoolID: {
        type: Number,
        unique: true
    },
    schoolPassword: {
        type: String,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    }],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'admin'
    },
    schoolPicture:{
        type:String,
    }
}, { timestamps: true });

const schoolModel = mongoose.model('school', schoolSchema);
module.exports = schoolModel;