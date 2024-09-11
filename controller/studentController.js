const studentModel = require("../models/studentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {sendMail} = require("../helpers/email");
const { studentSignUpTemplate, verifyTemplate } = require("../helpers/template");
const schoolModel = require("../models/schoolModel");
const cloudinary = require('../utils/cloudinary')
const attendanceModel = require('../models/attendanceModel')
const fs = require('fs')
const date = new Date();

exports.signUp = async (req, res) => {
  const generateID = function () {
    return Math.floor(Math.random() * 10000);
  };

  try {
    const { 
      fullName, 
      email, 
      address, 
      gender, 
      class: studentClass,
      studentProfile

    } = req.body;
    const studentID = generateID();
    const schoolID = req.user.schoolID; 
    if (
      !fullName || 
      !email || 
      !address || 
      !gender || 
      !studentClass ||
      !studentProfile
    ) {
      return res.status(400).json({
        status: "Bad request",
        message: "Please, all fields are required",
      });
    }
    const existingUser = await studentModel.findOne({ studentID });
    if (existingUser) {
      return res.status(400).json({
        status: "Bad request",
        message: "Student With This ID Already Exist",
      });
    }

    const school = await schoolModel.findOne({ schoolID });
    if (!school) {
      return res.status(400).json({
        status: "Bad request",
        message: `No school with id ${schoolID}`,
      });
    }
    const saltedPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(studentID.toString(), saltedPassword);

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "Student picture is required",
      });
    }
    const image = await cloudinary.uploader.upload(req.file.path);
    const data = new studentModel({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      address,
      gender,
      studentID:hashedPassword,
      school: school._id,
      class: studentClass,
      studentProfile: image.secure_url,
    });

    fs.unlink(file.path, (err) => {
      if (err) {
        console.error("Error deleting the file from local storage:", err);
      } else {
        console.log("File deleted from local storage");
      }
    });

    const userToken = jwt.sign(
      { id: data.studentID, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "30 mins" }
    );

    const verifyLink = `https://edutrack-v1cr.onrender.com/api/v1/student/verify/${userToken}`;
    const template = studentSignUpTemplate(verifyLink, `${data.fullName}`, `${data.studentID}`);

    let mailOptions = {
      email: data.email,
      subject: "Email Verification",
      html: template,
    };

    await data.save();
    school.students.push(data._id);
    await school.save();
    await sendMail(mailOptions);

    res.status(201).json({
      status: "ok",
      message: "Registration complete",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};


exports.signIn = async (req, res) => {
  try {
    const { email, studentID } = req.body;
    const existingStudent = await studentModel.findOne({ 
      email: email.toLowerCase(), 
      studentID 
    });

    if (!existingStudent) {
      return res.status(404).json({
        status: "Not Found",
        message: "No student found with this email and studentID.",
      });
    }

    if (!existingStudent.isVerified) {
      return res.status(400).json({
        status: "Bad request",
        message: "Student is not verified. Please check your email.",
      });
    }

    const userToken = jwt.sign(
      {
        userId: existingStudent._id,
        email: existingStudent.email,
        name: existingStudent.fullName,
        role: 'student',
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: `${existingStudent.fullName} is logged in`,
      data: existingStudent,
      userToken,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};
;



exports.verifyEmail = async (req, res) => {
  try {
    const { userToken } = req.params;
    const { email } = jwt.verify(userToken, process.env.JWT_SECRET);
    const student = await studentModel.findOne({ email:email });
    if (!student) {
      return res.status(404).json({
        status: "Not Found",
        message: "student Not found",
      });
    }
    if (student.isVerified) {
      return res.status(400).json({
        status: "Bad Request",
        message: "student Already verified",
      });
    }
    student.isVerified = true;
    await student.save();
    res.status(200).json({
      status: "ok",
      message: "student verified successfully",
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.json({ message: 'Link Expired' });
    }
    res.status(500).json({
      status: "server error",
      message: error.message,
    });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await studentModel.findOne({ email });
    if (!student) {
      return res.status(404).json({
        message: "school not found",
      });
    }
    if (student.isVerified) {
      return res.status(400).json({
        message: "school already verified",
      });
    }
    const userToken = jwt.sign({ email: student.email }, process.env.JWT_SECRET, {
      expiresIn: "20mins",
    });
    const verifyLink = `https://edutrack-v1cr.onrender.com/api/v1/student/verify/${userToken}`;
    let mailOptions = {
      email: student.email,
      subject: "Verification email",
      html: verifyTemplate(verifyLink, student.fullName),
    };
    await sendMail(mailOptions);
    res.status(200).json({
      message: "Verification email resent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateStudentClass = async (req, res) => {
  try {
    const { studentID, newClass } = req.body;
    const updatedStudent = await studentModel.findOneAndUpdate(
      { studentID },
      { class: newClass },
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found or registered' });
    }
    return res.status(200).json({ message: 'Student class updated successfully', data: updatedStudent });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { studentID } = req.params;
    const file = req.file;
    const existingStudent = await studentModel.findOne({ studentID });
    if (!existingStudent) {
      return res.status(404).json({
        status: 'Not Found',
        message: `No student found with ID ${studentID}`,
      });
    }
    if (file) {
      if (existingStudent.studentProfile) {
        const imagePublicId = existingStudent.studentProfile.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(imagePublicId);
      }
      const image = await cloudinary.uploader.upload(file.path);
      existingStudent.studentProfile = image.secure_url;
    }
    const updatePicture = await studentModel.findOneAndUpdate(
      { studentID }, 
      { studentProfile: existingStudent.studentProfile }, 
      { new: true }
    );
    res.status(200).json({
      status: 'Success',
      message: 'Profile picture updated successfully',
      data: updatePicture,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Server Error',
      message: error.message,
    });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentID } = req.user;
    const student = await studentModel.findById(studentID);
    if (!student) {
      return res.status(400).json({ message: `Student not found: ${studentID}` });
    }
    const attendance = await attendanceModel.find({ student: studentID });

    if (!attendance || attendance.length === 0) {
      return res.status(404).json({ message: "No attendance records found for this student" });
    }
    const attendanceRecords = attendance.map((record) => ({
      week: record.attendanceRecords.map(weekRecord => ({
        week: weekRecord.week,
        days: weekRecord.days,
      })),
    }));
    res.status(200).json({
      message: "Attendance records retrieved successfully",
      data: {
        studentName: student.fullName,
        attendanceRecords,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
