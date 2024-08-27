const express = require('express')
const { singUpVlidator, logInValidator } = require('../middleware/teacherValidation')
const { signUp, signIn } = require('../controller/teacherController')
const router = express.Router()
router.post('/sign-up',singUpVlidator,signUp)
router.post('/sign-in',logInValidator,signIn)
module.exports = router
