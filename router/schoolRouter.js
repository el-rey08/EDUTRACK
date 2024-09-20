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
  updateProfile,
  getWeeklyAttendancePercentage,
  upgradeSubscriptionPlan,
} = require("../controller/schoolController");
const {authenticate,checkAdminOrTeacher,checkAdmin} = require("../middleware/auth");
const { getOneTeacher, suspendTeacher } = require("../controller/teacherController");
const router = express.Router();
router.post("/sign_up",upload.single('schoolPicture'), signUpValidation, signUp);
router.post("/log-in", logInValidator, signIn);
router.post('/verify/:userToken', verifyEmail)
router.post("/resend-verify", resendVerificationEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-passord/:resetToken", authenticate,resetPassword);
router.get("/get-teachers", authenticate,checkAdmin,getAllTeachers);
router.get('/get-students',authenticate,checkAdmin,checkAdminOrTeacher,getAllStudents)
router.get('/getOne-student', authenticate,checkAdmin,checkAdminOrTeacher,getOneStudent)
router.get('/getOne-teacher', authenticate,checkAdmin,getOneTeacher)
router.delete('/delete-student',authenticate,checkAdmin,deleteStudent)
router.delete('/delete-teacher/:teacherID',authenticate,checkAdmin,deleteTeacher)
router.put('/update-profile/:schoolID',upload.single('schoolPicture'),updateProfile)
router.get('/percentage-record',authenticate, getWeeklyAttendancePercentage)
router.post('/upgrade-plan', authenticate,upgradeSubscriptionPlan)
router.get('/suspend-teacher/:teacherID', authenticate,checkAdmin,suspendTeacher)
module.exports = router;