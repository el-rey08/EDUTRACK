const express = require('express')
const upload = require('../utils/multer')
const { singUpVlidator, logInValidator } = require('../middleware/teacherValidation')
const { signUp, signIn, verifyEmail, updateProfile } = require('../controller/teacherController')
const { checkAdmin, authenticate } = require('../middleware/auth')
const router = express.Router()
router.post('/sign-up',upload.single('teacherProfile'),singUpVlidator, authenticate, checkAdmin, signUp);
router.post('/sign-in',logInValidator,signIn)
router.get('/verify/:userToken', verifyEmail)
router.put('/update-profile/:teacherID',upload.single('teacherProfile'), updateProfile)
module.exports = router
