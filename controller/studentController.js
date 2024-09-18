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
    let id;
    do {
      id = Math.floor(Math.random() * 10000);
    } while (id < 1000);
    return id; 
  };
  
  try {
    const { 
      fullName, 
      email, 
      address, 
      gender, 
      class: studentClass,
    } = req.body;
    
    const studentID = generateID();
    const schoolID = req.user.schoolID; 

    // Validate required fields
    if (!fullName || !email || !address || !gender || !studentClass) {
      return res.status(400).json({
        status: "Bad request",
        message: "Please, all fields are required",
      });
    }

    // Check if the student already exists
    const existingUser = await studentModel.findOne({ studentID });
    if (existingUser) {
      return res.status(400).json({
        status: "Bad request",
        message: "Student with this ID already exists",
      });
    }

    // Find the school
    const school = await schoolModel.findOne({ schoolID });
    if (!school) {
      return res.status(400).json({
        status: "Bad request",
        message: `No school with id ${schoolID}`,
      });
    }

    // Check subscription plan limits
    const plans = {
      freemium: 5,
      starter: 100,
      basic: 200,
      pro: 500,
      premium: 1000,
      enterprise: Infinity // Unlimited
    };

    const maxStudentsAllowed = plans[school.subscriptionPlan || 'freemium'];
    if (school.students.length >= maxStudentsAllowed) {
      return res.status(400).json({
        status: "Bad request",
        message: `You have reached the maximum number of students allowed for the ${school.subscriptionPlan} plan.`,
      });
    }

    // Upload student profile picture to Cloudinary
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "Student picture is required",
      });
    }

    const image = await cloudinary.uploader.upload(req.file.path);

    // Create the student
    const data = new studentModel({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      address,
      gender,
      studentID,
      school: school._id,
      class: studentClass,
      studentProfile: image.secure_url,
    });

    // Delete the file from local storage
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error("Error deleting the file from local storage:", err);
      } else {
        console.log("File deleted from local storage");
      }
    });

    // Generate JWT token for email verification
    const userToken = jwt.sign(
      { id: data.studentID, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "30 mins" }
    );

    // Send email verification link
    const verifyLink = `https://edutrack-jlln.onrender.com/api/v1/student/verify/${userToken}`;
    const template = studentSignUpTemplate(verifyLink, `${data.fullName}`, `${data.studentID}`);

    let mailOptions = {
      email: data.email,
      subject: "Email Verification",
      html: template,
    };

    // Save the student to the database
    await data.save();
    school.students.push(data._id);
    await school.save();

    // Send verification email
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
      { expiresIn: "1d" }
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
    const { email, id } = jwt.verify(userToken, process.env.JWT_SECRET);
    const student = await studentModel.findOne({ email:email, studentID: id });
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
    const verifyLink = `https://edutrack-jlln.onrender.com/api/v1/student/verify/${userToken}`;
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
    const { userId } = req.user;
    const student = await studentModel.findById(userId);
    if (!student) {
      return res.status(404).json({
        status: "Not Found",
        message: "Student Not Found",
      });
    }
    const attendanceRecords = await attendanceModel.find({ student: userId });
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Student Attendance Record not Found",
      });
    }
    const studentAttendance = attendanceRecords.map((attendance) => {
      return {
        studentName: student.fullName, 
        attendanceRecords: attendance.attendanceRecords.map((record) => {
          const days = record.days || {};
          const populatedDays = Object.keys(days).length > 0 ? days : {
            Monday: null,
            Tuesday: null,
            Wednesday: null,
            Thursday: null,
            Friday: null,
          };

          return {
            week: record.week,
            days: populatedDays,
          };
        }),
      };
    });
    res.status(200).json({
      status: "OK",
      message: "Student Attendance Retrieved Successfully",
      data: studentAttendance,
    });
  } catch (error) {
    res.status(500).json({
      status: "Server Error",
      message: error.message,
    });
  }
};