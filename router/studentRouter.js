const express = require('express')
const router = express.Router()
const { signUp, verifyEmail, signIn, updateStudentClass, updateProfile, resendVerificationEmail, getStudentAttendance } = require('../controller/studentController')
const { singUpVlidator, logInValidator } = require('../middleware/validation')
const { checkAdminOrTeacher, authenticate } = require('../middleware/auth')
const upload = require('../utils/multer')
router.post('/sign-up' ,upload.single('studentProfile'),singUpVlidator,authenticate,checkAdminOrTeacher,signUp) 
router.post('/sign-in',logInValidator,signIn)
router.post('/verify/:userToken',verifyEmail)
router.get('/resend-link', authenticate,checkAdminOrTeacher,resendVerificationEmail)
router.put('/update-class',authenticate,checkAdminOrTeacher,updateStudentClass)
router.put('/update-profile/:studentID',upload.single('studentProfile'),updateProfile)
router.get('/my-record', authenticate,getStudentAttendance)
module.exports = router 