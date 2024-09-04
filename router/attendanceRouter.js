const express = require('express')
const { authenticate, checkAdminOrTeacher } = require('../middleware/auth')
const { takeAttendance } = require('../controller/attendanceController')
const router = express.Router()
router.post('/attendance',authenticate,checkAdminOrTeacher,takeAttendance)
module.exports= router
