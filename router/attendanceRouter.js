const express = require('express')
const { authenticate, checkAdminOrTeacher } = require('../middleware/auth')
const { takeAttendance, getStudentAttendance, } = require('../controller/attendanceController')
const router = express.Router()
router.post('/mark-attendance',authenticate,checkAdminOrTeacher,takeAttendance)
router.get('/student-attendance/:studentID', getStudentAttendance)
module.exports= router
