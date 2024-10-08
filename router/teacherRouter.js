const express = require('express')
const upload = require('../utils/multer')
const { singUpVlidator, logInValidator } = require('../middleware/teacherValidation')
const { signUp, signIn, verifyEmail, updateProfile, resendVerificationEmail, forgetPassword, resetPassword,} = require('../controller/teacherController')
const { checkAdmin, authenticate, checkAdminOrTeacher } = require('../middleware/auth')
const router = express.Router()
router.post('/sign-up',upload.single('teacherProfile'),singUpVlidator, authenticate, checkAdmin, signUp);
router.post('/sign-in',logInValidator,signIn)
router.post('/verify/:userToken', verifyEmail)
router.get('/resend-link',authenticate,checkAdminOrTeacher, resendVerificationEmail)
router.put('/update-profile/:teacherID',upload.single('teacherProfile'), updateProfile)
router.post('/forget-password', forgetPassword)
router.post('/reset-password',authenticate,resetPassword)
module.exports = router
