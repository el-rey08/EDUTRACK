const express = require('express')
const { signUp, verifyEmail, signIn, updateStudentClass } = require('../controller/studentController')
const { singUpVlidator, logInValidator } = require('../middleware/validation')
const { checkAdminOrTeacher, authenticate } = require('../middleware/auth')
const router = express.Router()
router.post('/sign-up',singUpVlidator,authenticate,checkAdminOrTeacher,signUp) 
router.post('/sign-in',logInValidator,signIn)
router.get('/verify/:token',verifyEmail)
router.put('/update-class',authenticate,checkAdminOrTeacher,updateStudentClass)
module.exports = router