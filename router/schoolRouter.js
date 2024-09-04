const express = require("express");
const upload = require('../utils/multer')
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
  getall,
  remove,
  updateProfile,
} = require("../controller/schoolController");
const {authenticate,checkAdminOrTeacher,checkAdmin} = require("../middleware/auth");
const { getOneTeacher } = require("../controller/teacherController");
const router = express.Router();
router.post("/sign_up",upload.single('schoolProfile'), signUpValidation, signUp);
router.post("/log-in", logInValidator, signIn);
router.get('/verify/:userToken', verifyEmail)
router.post("/resend-verify", resendVerificationEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-passord/:resetToken", resetPassword);
router.get("/get-teachers", authenticate,checkAdmin,getAllTeachers);
router.get('/get-students',authenticate,checkAdmin,checkAdminOrTeacher,getAllStudents)
router.get('/getOne-student', authenticate,checkAdmin,checkAdminOrTeacher,getOneStudent)
router.get('/getOne-teacher', authenticate,checkAdmin,getOneTeacher)
router.delete('/delete-student',authenticate,checkAdmin,deleteStudent)
router.delete('/delete-teacher',authenticate,checkAdmin,deleteTeacher)
router.put('/update-profile/:schoolID',upload.single('schoolProfile'),updateProfile)
router.get('/geteverything', getall)
router.delete('/clear/:schoolID',remove)
module.exports = router;