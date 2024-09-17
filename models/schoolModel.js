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
    schoolPicture: {
        type: String,
        required: true
    },

    // New fields for payment and plan
    subscriptionPlan: {
        type: String,
        enum: ['freemium', 'starter', 'basic', 'pro', 'premium', 'enterprise'],
        default: 'freemium' // Default plan
    },
    maxStudents: {
        type: Number,
        default: 5 // Default to Freemium limit
    },
    maxTeachers: {
        type: Number,
        default: 3 // Default to Freemium limit
    },
    paymentStatus: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'canceled'],
        default: 'inactive'
    },
    subscriptionStartDate: {
        type: Date
    },
    subscriptionEndDate: {
        type: Date
    },
    customPrice: {
        type: Number,
        default: 0 // Only used if the plan is 'enterprise'
    }
});

const schoolModel = mongoose.model('school', schoolSchema);
module.exports = schoolModel;
