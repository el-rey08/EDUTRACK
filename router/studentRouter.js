const express = require('express')
const router = express.Router()
const { signUp, verifyEmail, signIn, updateStudentClass, updateProfile, resendVerificationEmail } = require('../controller/studentController')
const { singUpVlidator, logInValidator } = require('../middleware/validation')
const { checkAdminOrTeacher, authenticate } = require('../middleware/auth')
const upload = require('../utils/multer')
router.post('/sign-up' ,upload.single('studentProfile'),singUpVlidator,authenticate,checkAdminOrTeacher,signUp) 
router.post('/sign-in',logInValidator,signIn)
router.get('/verify/:userToken',verifyEmail)
router.get('/resend-link', authenticate,checkAdminOrTeacher,resendVerificationEmail)
router.put('/update-class',authenticate,checkAdminOrTeacher,updateStudentClass)
router.put('/update-profile',upload.single('studentProfile'), updateProfile)
module.exports = router 