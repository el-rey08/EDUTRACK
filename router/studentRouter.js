const express = require('express')
const { signUp, verifyEmail, signIn } = require('../controller/studentController')
const { singUpVlidator, logInValidator } = require('../middleware/validation')
const router = express.Router()
router.post('/sign-up',singUpVlidator,signUp)
router.post('/sign-in',logInValidator,signIn)
router.get('/verify/:token',verifyEmail)
module.exports = router