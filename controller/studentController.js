const studentModel = require("../models/studentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendMail = require("../helpers/email");
const {
  signUpTemplate,
  verifyTemplate,
} = require("../helpers/template");
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
    } = req.body;

    if (
      !firstName ||
      !surnName ||
      !lastName ||
      !email ||
      !password ||
      !address ||
      !state ||
      !gender ||
      !dateOfBirth
    ) {
      return res.status(400).json({
        status: "Bad request",
        message: "Please, all fields are required",
      });
    }

    const existingUser = await studentModel.findOne({email });
    if (existingUser) {
      return res.status(400).json({
        status: "Bad request",
        message: "This user already exists",
      });
    }

    const saltedPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltedPassword);
    const studentID = generateID();
    const data = new studentModel({
      firstName,
      surnName,
      lastName,
      email:email.toLowerCase().trim(),
      password: hashedPassword,
      address,
      state,
      gender,
      age: new Date().getFullYear() - new Date(dateOfBirth).getFullYear(),
      studentID,
      dateOfBirth,
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

    await data.save();
    await sendMail(mailOptions);

    res.status(201).json({
      status: "ok",
      message: "Registration complete",
      data
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};

exports.signIn = async(req, res)=>{
  try {
    const {studentID,
      password,
    }=req.body
    const existingUser = await studentModel.findOne({studentID})
    if(!existingUser){
      return res.status(404).json({
        status:'Not Found',
        message:'No user with the Above information kindly see the admin for registration'
      })
    }
  
    const checkPassword = await bcrypt.compare(password, existingUser.password)
    if(!checkPassword){
      return res.status(400).json({
        status:'Bad request',
        message:'incorrect password please check your password'
      })
    }
    // if(!studentID){
    //   return res.status(400).json({
    //     status:'Bad request',
    //     message:'incorrect student ID'
    //   })
    // }
    if(!existingUser.isVerified){
      return res.status(400).json({
        status:'Bad request',
        message:'user not verified please check your email for verification link'
      })
    }
    const token = jwt.sign(
      {
        userId: existingUser.studentID,
        email: existingUser.email,
        name: existingUser.firstName,
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
      status:'server error',
      message:error.message
    })
  }
  }

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const existingUser = await studentModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        status: "Not Found",
        message: "User not found",
      });
    }
    if (existingUser.isVerified) {
      return res.status(400).json({
        status: "Bad Request",
        message: "User already verified",
      });
    }
    existingUser.isVerified = true;
    await existingUser.save();
    res.status(200).json({
      status: "ok",
      message: "User verified successfully",
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
