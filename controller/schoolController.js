const schoolModel = require("../models/schoolModel");
const bcrypt = require("bcrypt");
const {sendMail} = require("../helpers/email");
const jwt = require("jsonwebtoken");
const { signUpTemplate, verifyTemplate } = require("../helpers/template");
const teacherModel = require("../models/teachearModel");
const studentModel = require("../models/studentModel");
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const date = new Date();

exports.signUp = async (req, res) => {
  console.log("request body",req.body);
  const generateID = function () {
    return Math.floor(1000 + Math.random() * 9000);
  };
  try {
    const {
      schoolName,
      schoolType,
      schoolAddress,
      schoolPhone,
      schoolEmail,
      schoolPassword,
    } = req.body;
    if (
      !schoolName ||
      !schoolType ||
      !schoolAddress ||
      !schoolPhone ||
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
        const image = await cloudinary.uploader.upload(file.path)
    const newData = new schoolModel({
      schoolName,
      schoolType,
      schoolAddress,
      schoolPhone,
      schoolEmail: schoolEmail.toLowerCase().trim(),
      schoolPassword: hashedPassword,
      schoolID,
      schoolPicture:image.secure_url
    });
    const userToken = jwt.sign(
      { id: newData.schoolID, email: newData.schoolEmail },
      process.env.JWT_SECRET,
      { expiresIn: "30min" }
    );
    const verifyLink = `https://edutrack-v1cr.onrender.com/api/v1/school/verify/${userToken}`;
    ;
    let mailOptions = {
      email: newData.schoolEmail,
      subject: "Email Verification",
      html: signUpTemplate(verifyLink, `${newData.schoolName}`),
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
    const { schoolEmail, schoolPassword } = req.body;
    const existingSchool = await schoolModel.findOne({ schoolEmail });
    if (!existingSchool) {
      return res.status(404).json({
        status: "Not Found",
        message:
          "No Student with the Above information kindly see the admin for registration",
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
    console.log(userId)
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
    const { schoolEmail } = jwt.verify(userToken, process.env.JWT_SECRET);
    console.log("Decoded token data:", { schoolEmail });
    const existingSchool = await schoolModel.findOne({ schoolEmail });
    if (!existingSchool) {
      return res.status(404).json({
        status: "Not Found",
        message: "School Not found",
      });
    }
    if (existingSchool.isVerified) {
      return res.status(400).json({
        status: "Bad Request",
        message: "School Already verified",
      });
    }
    existingSchool.isVerified = true;
    await existingSchool.save();
    res.status(200).json({
      status: "ok",
      message: "School verified successfully",
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
    const { schoolEmail } = req.body;
    const school = await schoolModel.findOne({ schoolEmail });
    console.log("Decoded token data:", { schoolEmail });
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
    const verifyLink =`https://edutrack-v1cr.onrender.com/api/v1/school/verify/${userToken}`
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
    const { schoolEmail } = req.body;
    const school = await schoolModel.findOne({ schoolEmail });
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
      html: `please click the link to reset your password: <a href="https://edutrack-v1cr.onrender.com/api/v1/school/verify/${userToken}>Reset password</a>link expiers in 30min"`,
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
    const { schoolEmail } = jwt.verify(userToken, process.env.JWT_SECRET);
    const school = await schoolModel.findOne({ schoolEmail });
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


exports.getall = async(req, res)=>{
  try {
    const school= await schoolModel.find()
    if(!school){
      return res.status(404).json({
        message:'school not found',
        
      })
    }
    res.status(200).json({
      message:'here we go',
      data:school
    })
  } catch (error) {
    res.status(500).json(error.message)
  }
}


exports.remove = async (req, res) => {
  try {
    const { schoolID } = req.params;
    const deleteSchool = await schoolModel.findOneAndDelete({ schoolID });
    if (!deleteSchool) {
      return res.status(404).json({
        status: "Not Found",
        message: "Student not found",
      });
    }
    res.status(200).json({
      status: "OK",
      message: "Student successfully deleted",
      data: deleteSchool,
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};
