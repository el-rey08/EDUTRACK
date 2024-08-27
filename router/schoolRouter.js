const express = require("express");
const {
  signUpValidation,
  logInValidator,
} = require("../middleware/schoolValidation");
const {
  signUp,
  signIn,
  // getOneStudent,
  // getOneTeacher,
  resendVerificationEmail,
  forgetPassword,
  resetPassword,
  verifyEmail,
  getAllTeachers,
  getAllStudents,
  deleteTeacher,
  getOneStudent
} = require("../controller/schoolController");
const {authenticate,checkAdminOrTeacher,checkAdmin} = require("../middleware/auth");
const router = express.Router();
router.post("/sign_up", signUpValidation, signUp);
router.post("/log-in", logInValidator, signIn);
router.get('/verify/:token', verifyEmail)
// router.get("/get-student/school/:studentID",getOneStudent);
// router.get("/get-teacher/school/:teacherID", authenticate,getOneTeacher);
router.post("/resend-verify", resendVerificationEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-passord/:token", resetPassword);
router.get("/get-teachers", authenticate,getAllTeachers);
router.get('/get-students',getAllStudents)
router.delete("/delete-student/:studentID", authenticate,);
router.delete("/delete-student/:teacherID", authenticate,deleteTeacher);
router.get('/getOne', authenticate,checkAdmin,getOneStudent)
module.exports = router;


