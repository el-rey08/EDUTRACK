const attendanceModel = require('../models/attendanceModel')
const sendAttendanceNotification = require('../helpers/email')
const{generateEmailContent}= require('../helpers/template')
const studentModel = require('../models/studentModel')

exports.markAttendance = async (req, res)=>{
    try {
        const{
            studentID, status
        }=req.body
    } catch (error) {
        res.status(500).json({
            status:'sever error',
            message:error.message
        })
    }
}