
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    fullName: {
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
    teacherClass: {
        type: String,
        required: true,
        enum: [
            'JSS 1', 'JSS 2', 'JSS 3',
            'SS 1', 'SS 2', 'SS 3'
        ],
      },
    address: {
        type: String,
        required: true
    },
   
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },

    status: { 
        type: String, 
        enum: ['active', 'suspend', 'unsuspend'], 
        default: 'active'
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
    student: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "school"
    },
    role: {
        type: String,
        default: 'teacher'
    },
    teacherProfile:{
        type:String,
        require:true
    }
});

const teacherModel = mongoose.model('teacher', teacherSchema);
module.exports = teacherModel;