const studentModel = require("../models/studentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {sendMail} = require("../helpers/email");
const { signUpTemplate, verifyTemplate } = require("../helpers/template");
const schoolModel = require("../models/schoolModel");
const cloudinary = require('../utils/cloudinary')
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
      password,
      address,
      state,
      gender,
      dateOfBirth,
      schoolID,
      class: studentClass,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !address ||
      !state ||
      !schoolID ||
      !gender ||
      !dateOfBirth ||
      !studentClass
    ) {
      return res.status(400).json({
        status: "Bad request",
        message: "Please, all fields are required",
      });
    }

    const existingUser = await studentModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "Bad request",
        message: "This Student already exists",
      });
    }

    const school = await schoolModel.findOne({schoolID})
    if (!school) {
      return res.status(400).json({
        status:"Bad request",
        message:`No school with id ${schoolID}`
      })
    }

    const saltedPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltedPassword);
    const studentID = generateID();
    const file = req.file
    if(!file){
      return res.status(400).json({
        message:'student picture is required'
      })
    };
    const image = await cloudinary.uploader.upload(req.file)
    const data = new studentModel({
      fullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      address,
      state,
      gender,
      age: new Date().getFullYear() - new Date(dateOfBirth).getFullYear(),
      studentID,
      school:school._id,
      dateOfBirth,
      class: studentClass,
      studentProfile:image.secure_url
    });
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting the file from local storage:', err);
      } else {
        console.log('File deleted from local storage');
      }
    });
    const userToken = jwt.sign(
      { id: data.studentID, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "30 mins" }
    );

    const verifyLink =`https://edutrack-v1cr.onrender.com/api/v1/student/verify/${userToken}`;
    let mailOptions = {
      email: data.email,
      subject: "Email Verification",
      html: signUpTemplate(verifyLink, `${data.fullName}`),
    };

    await data.save()
    school.students.push(data._id)
    await school.save()
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
    const { studentID, password } = req.body;
    const existingUser = await studentModel.findOne({ studentID });
    if (!existingUser) {
      return res.status(404).json({
        status: "Not Found",
        message:
          "No Student with the Above information kindly see the admin for registration",
      });
    }

    const checkPassword = await bcrypt.compare(password, existingUser.password);
    if (!checkPassword) {
      return res.status(400).json({
        status: "Bad request",
        message: "incorrect password please check your password",
      });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({
        status: "Bad request",
        message:
          "Student not verified please check your email for verification link",
      });
    }
    const userToken = jwt.sign(
      {
        userId: existingUser.studentID,
        email: existingUser.email,
        name: existingUser.firstName,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: `${existingUser.fullName} is logged in`,
      data: existingUser,
      userToken,
    });
  } catch (error) {
    res.status(500).json({
      status: "server error",
      message: error.message,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { studentID } = req.params;
    const existingUser = await studentModel.findOne({ studentID });
    if (!existingUser) {
      return res.status(404).json({
        status: "Not Found",
        message: "Student Not found",
      });
    } else {
      return res.status(200).json({
        status: "Request ok",
        message: `${existingUser.fullName} this is your attendance record`,
      });
    }
  } catch (error) {
    es.status(500).json({
      status: "server error",
      message: error.message,
    });
  }
};

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