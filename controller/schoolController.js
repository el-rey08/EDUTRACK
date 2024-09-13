const schoolModel = require("../models/schoolModel");
const bcrypt = require("bcrypt");
const {sendMail} = require("../helpers/email");
const jwt = require("jsonwebtoken");
const { schoolSignUpTemplate, verifyTemplate } = require("../helpers/template");
const teacherModel = require("../models/teachearModel");
const studentModel = require("../models/studentModel");
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const date = new Date();

exports.signUp = async (req, res) => {
  const generateID = function () {
    return Math.floor(1000 + Math.random() * 9000);
  };
  try {
    const {
      schoolName,
      schoolAddress,
      schoolEmail,
      schoolPassword,
    } = req.body;
    if (
      !schoolName ||
      !schoolAddress ||
      !schoolEmail ||
      !schoolPassword 
    ) {
      return res.status(400).json({
        status: "Bad Request",
        message: "All fields are required",
      });
    }
    const existingSchool = await schoolModel.findOne({ schoolEmail });
    if (existingSchool) {
      return res.status(400).json({
        status: "Bad Request",
        message: "This school already exists",
      });
    }
    const saltedPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(schoolPassword, saltedPassword);
    let schoolID = generateID();
    const file = req.file
    if(!file){
     return res.status(400).json({
      message:'School image is required'
     })
    }
    const image = await cloudinary.uploader.upload(req.file.path)
    const newData = new schoolModel({
      schoolName:schoolName.trim(),
      schoolAddress,
      schoolEmail: schoolEmail.toLowerCase().trim(),
      schoolPassword: hashedPassword,
      schoolID,
      schoolPicture:image.secure_url
    });
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting the file from local storage:', err);
      } else {
        console.log('File deleted from local storage');
      }
    });
    const userToken = jwt.sign(
      { id: newData.schoolID, email: newData.schoolEmail },
      process.env.JWT_SECRET,
      { expiresIn: "30 mins" }
    );
    const verifyLink = `https://edutrack-jlln.onrender.com/api/v1/school/verify/${userToken}`;
    
    let mailOptions = {
      email: newData.schoolEmail,
      subject: "Email Verification",
      html: schoolSignUpTemplate(verifyLink, `${newData.schoolName}`),
    };
    await newData.save();
    await sendMail(mailOptions);
    res.status(201).json({
      status: "ok",
      message: "Registration complete. Please verify your email.",
      newData,
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
    console.log('Testing Sign')
    const { schoolEmail, schoolPassword } = req.body;
    console.log(schoolEmail)
    const existingSchool = await schoolModel.findOne({ schoolEmail:schoolEmail.toLowerCase() })
    console.log(existingSchool)
    if (!existingSchool) {
      return res.status(404).json({
        status: "Not Found",
        message:"No School found",
      });
    }

    const checkPassword = await bcrypt.compare(
      schoolPassword,
      existingSchool.schoolPassword
    );
    if (!checkPassword) {
      return res.status(400).json({
        status: "Bad request",
        message: "incorrect password please check your password",
      });
    }

    if (!existingSchool.isVerified) {
      return res.status(400).json({
        status: "Bad request",
        message:
          "School not verified please check your email for verification link",
      });
    }
    const userToken = jwt.sign(
      {
        userId: existingSchool._id,
        email: existingSchool.schoolEmail,
        name: existingSchool.schoolName,
        role: existingSchool.role,
        schoolID: existingSchool.schoolID
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: `${existingSchool.schoolName} is logged in`,
      data: existingSchool,
      userToken,
    });
  } catch (error) {
    res.status(500).json({
      status: "server error",
      message: error.message,
    });
  }
};

exports.getOneStudent = async (req, res) => {
  try {
    const { studentID } = req.body;
    const {userId} = req.user
    const school = await schoolModel.findOne({_id:userId}).populate('students')
    if(!school){
      return res.status(404).json({
        status:'Not found',
        message:'school not found'
      })
    }
    const getOne = await studentModel.findOne({ studentID });
    if (!getOne) {
      return res
        .status(404)
        .json({ message: "student not found or registered" });
    }
    return res
      .status(200)
      .json({ message: "below is the student you request for", data: getOne });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const { userId} = req.user;
    const school = await schoolModel.findOne({_id: userId }).populate('teachers');
    console.log(school)
    if (!school) {
      return res.status(404).json({
        status: "Not found",
        message: "School not found",
      });
    }
    const teachers = school.teachers;
    if (teachers.length <= 0) {
      return res.status(404).json({
        status: "Not found",
        message: "No teachers found in this school",
      });
    }
    res.status(200).json({
      status: "OK",
      message: `Found ${teachers.length} registered teachers in the school`,
      data: school,
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const { userId} = req.user;
    const school = await schoolModel.findOne({ _id: userId }).populate('students');
    if (!school) {
      return res.status(404).json({
        status: "Not found",
        message: "School not found",
      });
    }
    const students = school.students;
    if (students.length <= 0) {
      return res.status(404).json({
        status: "Not found",
        message: "No students found in this school",
      });
    }
    res.status(200).json({
      status: "OK",
      message: `Found ${students.length} registered students in the school`,
      data: school,
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { studentID } = req.body;
    const school = await schoolModel.findOne({ _id: userId }).populate('students');
    if (!school) {
      return res.status(404).json({
        status: "Not found",
        message: "School not found",
      });
    }
    const student = await studentModel.findOneAndDelete({ studentID, school: userId });
    if (!student) {
      return res.status(404).json({
        status: "Not found",
        message: "Student not found in this school",
      });
    }
    school.students.pull(student._id);
    await school.save();
    res.status(200).json({
      status: "OK",
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { userId } = req.user;
    const { teacherID } = req.body;
    const school = await schoolModel.findOne({ _id: userId }).populate('teachers');
    if (!school) {
      return res.status(404).json({
        status: "Not found",
        message: "School not found",
      });
    }
    const teacher = await teacherModel.findOneAndDelete({ teacherID, school: userId });
    if (!teacher) {
      return res.status(404).json({
        status: "Not found",
        message: "teacher not found in this school",
      });
    }
    school.teachers.pull(teacher._id);
    await school.save();

    res.status(200).json({
      status: "OK",
      message: "teacher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { userToken } = req.params;
    const { email } = jwt.verify(userToken, process.env.JWT_SECRET);
    const existingSchool = await schoolModel.findOne({ schoolEmail:email });
    if (!existingSchool) {
      return res.status(404).json({
        status: "Not Found",
        message: "school Not found",
      });
    }
    if (existingSchool.isVerified) {
      return res.status(400).json({
        status: "Bad Request",
        message: "school Already verified",
      });
    }
    existingSchool.isVerified = true;
    await existingSchool.save();
    res.status(200).json({
      status: "ok",
      message: "school verified successfully",
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.json({ message: "Link expired." });
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
    const school = await schoolModel.findOne({ shoolEmail:email });
    if (!school) {
      return res.status(404).json({
        message: "school not found",
      });
    }
    if (school.isVerified) {
      return res.status(400).json({
        message: "school already verified",
      });
    }
    const userToken = jwt.sign(
      { email: school.schoolEmail },
      process.env.JWT_SECRET,
      {
        expiresIn: "20mins",
      }
    );
    const verifyLink =`https://edutrack-jlln.onrender.com/api/v1/school/verify/${userToken}`
    ;
    let mailOptions = {
      email: school.schoolEmail,
      subject: "Verification email",
      html: verifyTemplate(verifyLink, school.schoolName),
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

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const school = await schoolModel.findOne({ schoolEmail:email });
    if (!school) {
      res.status(404).json({
        message: "school not found",
      });
    }
    const resetToken = jwt.sign(
      { email: school.schoolEmail },
      process.env.JWT_SECRET,
      {
        expiresIn: "20mins",
      }
    );
    let mailOptions = {
      email: school.schoolEmail,
      subject: "password reset",
      html: `please click the link to reset your password: <a href="https://edutrack-jlln.onrender.com/api/v1/school/forget-password/${resetToken}>Reset password</a>link expiers in 30min"`,
    };
    await sendMail(mailOptions);
    res.status(200).json({
      message: "password reset email sent succesfully",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userToken } = req.params;
    const { schoolPassword } = req.body;
    const { email } = jwt.verify(userToken, process.env.JWT_SECRET);
    const school = await schoolModel.findOne({ schoolEmail:email });
    if (!school) {
      res.status(404).json({
        message: "user not found",
      });
    }
    const saltedRound = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(schoolPassword, saltedRound);
    school.schoolPassword = hashed;
    await school.save();
    res.status(200).json({
      message: "password reset successfully",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { schoolID } = req.params;
    const file = req.file;
    const existingSchool = await schoolModel.findOne({ schoolID });
    if (!existingSchool) {
      return res.status(404).json({
        status: 'Not Found',
        message: `No school found with ID ${schoolID}`,
      });
    }
    if (file) {
      if (existingSchool.schoolPicture) {
        const imagePublicId = existingSchool.schoolPicture.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(imagePublicId);
      }
      const image = await cloudinary.uploader.upload(file.path);
      existingSchool.schoolPicture = image.secure_url;
    }
    const updatePicture = await schoolModel.findOneAndUpdate(
      { schoolID }, 
      { schoolPicture: existingSchool.schoolPicture }, 
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
