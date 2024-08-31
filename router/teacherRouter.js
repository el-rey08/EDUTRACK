const express = require('express')
const { singUpVlidator, logInValidator } = require('../middleware/teacherValidation')
const { signUp, signIn, verifyEmail } = require('../controller/teacherController')
const { checkAdmin, authenticate } = require('../middleware/auth')
const router = express.Router()
router.post('/sign-up',singUpVlidator, authenticate, checkAdmin, signUp);
router.post('/sign-in',logInValidator,signIn)
router.get('/verify-email/:token', verifyEmail)
module.exports = router
