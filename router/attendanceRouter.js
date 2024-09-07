const express = require('express')
const { authenticate, checkAdminOrTeacher } = require('../middleware/auth')
const { takeAttendance, getStudentAttendance, getAllStudentAttendance, } = require('../controller/attendanceController')
const router = express.Router()
router.post('/mark-attendance/:studentID',authenticate,checkAdminOrTeacher,takeAttendance)
router.get('/student-attendance/:studentID', getStudentAttendance)
router.get('/all-attendance/:schoolID', getAllStudentAttendance)
module.exports= router
