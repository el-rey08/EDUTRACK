const studentModel = require("../models/studentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendMail = require("../helpers/email");
const { signUpTemplate, verifyTemplate } = require("../helpers/template");
const schoolModel = require("../models/schoolModel");
const cloudinary = require('../utils/cloudinary')
const date = new Date();

exports.signUp = async (req, res) => {
  const generateID = function () {
    return Math.floor(Math.random() * 10000);
  };

  try {
    const {
      firstName,
      surnName,
      lastName,
      email,
      password,
      address,
      state,
      gender,
      dateOfBirth,
      schoolID,
      class: studentClass, // Added the class field
    } = req.body;

    if (
      !firstName ||
      !surnName ||
      !lastName ||
      !email ||
      !password ||
      !address ||
      !state ||
      !schoolID ||
      !gender ||
      !dateOfBirth ||
      !studentClass // Added class to the required fields check
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
        const image = await cloudinary_js_config.uploader.upload(file.path)
    const data = new studentModel({
      firstName,
      surnName,
      lastName,
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
    const userToken = jwt.sign(
      { id: data.studentID, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "30min" }
    );

    const verifyLink = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/student/verify/${userToken}`;
    let mailOptions = {
      email: data.email,
      subject: "Email Verification",
      html: signUpTemplate(verifyLink, `${data.firstName} ${data.lastName}`),
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
    const token = jwt.sign(
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
      message: `${existingUser.firstName} is logged in`,
      data: existingUser,
      token,
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
        message: `${existingUser.firstName} this is your attendance record`,
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
    const { token } = req.params;
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const existingUser = await studentModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        status: "Not Found",
        message: "Student Not found",
      });
    }
    if (existingUser.isVerified) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Student Already verified",
      });
    }
    existingUser.isVerified = true;
    await existingUser.save();
    res.status(200).json({
      status: "ok",
      message: "Student verified successfully",
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
