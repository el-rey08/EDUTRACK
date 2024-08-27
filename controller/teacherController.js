const teacherModel = require("../models/teachearModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../helpers/email");
const { signUpTemplate, verifyTemplate } = require("../helpers/template");
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
      address,
      email,
      password,
      state,
      gender,
      maritalStatus,
      phoneNumber,
    } = req.body;
    if (
      (!firstName ||
        !lastName ||
        !surnName ||
        !address ||
        !email ||
        !password ||
        !state ||
        !gender ||
        !maritalStatus,
      !phoneNumber)
    ) {
      return res.status(400).json({
        status: "Bad request",
        message: "All field are required",
      });
    }
    const existingTeacher = await teacherModel.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        status: "Bad request",
        message: "Teacher already exist",
      });
    }
    const saltedPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltedPassword);
    let teacherID = generateID();
    const data = new teacherModel({
      firstName,
      surnName,
      lastName,
      address,
      email,
      password: hashedPassword,
      state,
      teacherID,
      gender,
      maritalStatus,
      phoneNumber,
    });
    const userToken = jwt.sign(
      { id: data.teacherID, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "30min" }
    );

    const verifyLink = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/teacher/verify/${userToken}`;
    let mailOptions = {
      email: data.email,
      subject: "Email Verification",
      html: signUpTemplate(verifyLink, `${data.firstName} ${data.lastName}`),
    };

    await data.save();
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
    const token = jwt.sign(
      {
        userId: existingTeacher.teacherID,
        email: existingTeacher.email,
        name: existingTeacher.firstName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: `${existingTeacher.firstName} is logged in`,
      data: existingTeacher,
      token,
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

