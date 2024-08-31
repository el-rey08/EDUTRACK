const express = require("express");
const uplods = require('../utils/multer')
const {
  signUpValidation,
  logInValidator,
} = require("../middleware/schoolValidation");
const {
  signUp,
  signIn,
  resendVerificationEmail,
  forgetPassword,
  resetPassword,
  verifyEmail,
  getAllTeachers,
  getAllStudents,
  getOneStudent,
  deleteStudent,
  deleteTeacher,
} = require("../controller/schoolController");
const {authenticate,checkAdminOrTeacher,checkAdmin} = require("../middleware/auth");
const { getOneTeacher } = require("../controller/teacherController");
const router = express.Router();
router.post("/sign_up",uplods.single('schoolProfile'), signUpValidation, signUp);
router.post("/log-in", logInValidator, signIn);
router.get('/verify/:token', verifyEmail)
router.post("/resend-verify", resendVerificationEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-passord/:token", resetPassword);
router.get("/get-teachers", authenticate,checkAdmin,getAllTeachers);
router.get('/get-students',authenticate,checkAdmin,checkAdminOrTeacher,getAllStudents)
router.get('/getOne-student', authenticate,checkAdmin,checkAdminOrTeacher,getOneStudent)
router.get('/getOne-teacher', authenticate,checkAdmin,getOneTeacher)
router.delete('/delete-student',authenticate,checkAdmin,deleteStudent)
router.delete('/delete-teacher',authenticate,checkAdmin,deleteTeacher)
module.exports = router;