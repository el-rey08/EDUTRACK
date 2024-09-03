const teacherModel = require("../models/teachearModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
      address,
      email,
      password,
      state,
      gender,
      maritalStatus,
      phoneNumber,
      schoolID,
    } = req.body;
    if (
      !fullName ||
      !address ||
      !email ||
      !password ||
      !state ||
      !gender ||
      !schoolID ||
      !maritalStatus ||
      !phoneNumber
    ) {
      return res.status(400).json({
        status: "Bad request",
        message: "Please, all fields are required",
      });
    }
    const existingTeacher = await teacherModel.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        status: "Bad request",
        message: "Teacher already exists",
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
    const hashedPassword = await bcrypt.hash(password, saltedPassword);
    let teacherID = generateID();
    const file = req.file;
    const image = await cloudinary.uploader.upload(file.path);
    const data = new teacherModel({
      fullName,
      address,
      email:email.toLowerCase(),
      password: hashedPassword,
      state,
      teacherID,
      school: school._id,
      gender,
      maritalStatus,
      phoneNumber,
      teacherProfile: image.secure_url,
    });

    const userToken = jwt.sign(
      { id: data.teacherID, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "30min" }
    );

    const verifyLink = `https://edutrack-v1cr.onrender.com/api/v1/teacher/verify/${userToken}`;

    let mailOptions = {
      email: data.email,
      subject: "Email Verification",
      html: signUpTemplate(verifyLink, `${data.fullName}`),
    };
    await data.save();
    school.teachers.push(data._id);
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
    const { email, password } = req.body;
    const existingTeacher = await teacherModel.findOne({ email });
    if (!existingTeacher) {
      return re.status(404).json({
        status: "Not found",
        message: "teacher not found",
      });
    }
    const checkPassword = await bcrypt.compare(
      password,
      existingTeacher.password
    );
    if (!checkPassword) {
      return res.status(400).json({
        status: "Bad Request",
        message: "incorrect password please check your password",
      });
    }

    if (!existingTeacher.isVerified) {
      return res.status(400).json({
        status: "Bad request",
        message:
          "Teacher is  not verified please check your email for verification link",
      });
    }
    const userToken = jwt.sign(
      {
        userId: existingTeacher._id,
        email: existingTeacher.email,
        name: existingTeacher.fullName,
        role: existingTeacher.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: `${existingTeacher.fullName} is logged in`,
      data: existingTeacher,
      userToken,
    });
  } catch (error) {
    res.status(500).json({
      status: "server error",
      message: error.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { userToken } = req.params;
    const { email } = jwt.verify(userToken, process.env.JWT_SECRET);
    const teacher = await teacherModel.findOne({ email:email });
    if (!teacher) {
      return res.status(404).json({
        status: "Not Found",
        message: "Student Not found",
      });
    }
    if (teacher.isVerified) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Teacher Already verified",
      });
    }
    await teacher.save();
    res.status(200).json({
      status: "ok",
      message: "Teacher verified successfully",
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.json({ message:error.message });
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
    const teacher = await teacherModel.findOne({ email });
    if (!teacher) {
      return res.status(404).json({
        message: "school not found",
      });
    }
    if (school.isVerified) {
      return res.status(400).json({
        message: "school already verified",
      });
    }
    const userToken = jwt.sign({ email: teacher.email }, process.env.JWT_SECRET, {
      expiresIn: "20mins",
    });
    const verifyLink = `https://edutrack-v1cr.onrender.com/api/v1/teacher/verify/${userToken}`;
    let mailOptions = {
      email: teacher.email,
      subject: "Verification email",
      html: verifyTemplate(verifyLink, teacher.fullName),
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
    const teacher = await teacherModel.findOne({ email });
    if (!teacher) {
      res.status(404).json({
        message: "Teacher not found",
      });
    }
    const resetToken = jwt.sign(
      { email: teacher.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "20mins",
      }
    );
    let mailOptions = {
      email: teacher.email,
      subject: "password reset",
      html: `please click the link to reset your password: <a href="https://edutrack-v1cr.onrender.com/api/v1/teacher/verify/${resetToken}>Reset password</a>link expiers in 30min"`,
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
    const { password } = req.body;
    const { email } = jwt.verify(userToken, process.env.JWT_SECRET);
    const teacher = await teacherModel.findOne({ email });
    if (!teacher) {
      res.status(404).json({
        message: "user not found",
      });
    }
    const saltedRound = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, saltedRound);
    teacher.password = hashed;
    await teacher.save();
    res.status(200).json({
      message: "password reset successfully",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.getOneTeacher = async (req, res) => {
  try {
    const { teacherID } = req.body;
    const { userId } = req.user;
    const school = await schoolModel
      .findOne({ _id: userId })
      .populate("teachers");
    if (!school) {
      return res.status(404).json({
        status: "Not found",
        message: "School Not Found",
      });
    }
    const getOne = await teacherModel.findOne({ teacherID });
    if (!getOne) {
      return res.status(404).json({
         message: "Teacher not found or registered" 
        });
    }
    return res
      .status(200)
      .json({ 
        message: "Below is the teacher you requested",
         data: getOne
       });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { teacherID } = req.params;
    const file = req.file;
    const existingTeacher = await teacherModel.findOne({ teacherID });
    if (!existingTeacher) {
      return res.status(404).json({
        status: 'Not Found',
        message: `No student found with ID ${teacherID}`,
      });
    }
    if (file) {
      if (existingTeacher.teacherProfile) {
        const imagePublicId = existingTeacher.teacherProfile.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(imagePublicId);
      }
      const image = await cloudinary.uploader.upload(file.path);
      existingTeacher.teacherProfile = image.secure_url;
    }
    const updatePicture = await teacherModel.findOneAndUpdate(
      { teacherID }, 
      { teacherProfile: existingTeacher.teacherProfile }, 
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
