const schoolModel = require("../models/schoolModel");
const bcrypt = require("bcrypt");
const sendMail = require("../helpers/email");
const jwt = require("jsonwebtoken");
const { signUpTemplate, verifyTemplate } = require("../helpers/template");
const teacherModel = require("../models/teachearModel");
const studentModel = require("../models/studentModel");
const date = new Date();

exports.signUp = async (req, res) => {
  const generateID = function () {
    return Math.floor(Math.random() * 10000);
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
        message: "please All Field Are Required",
      });
    }
    const existingSchool = await schoolModel.findOne({ schoolEmail });
    if (existingSchool) {
      return res.status(400).json({
        status: "Bad Request",
        message: "This School Already Exist",
      });
    }
    const saltedPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(schoolPassword, saltedPassword);
    let schoolID = generateID();
    const data = new schoolModel({
      schoolName,
      schoolType,
      schoolAddress,
      schoolPhone,
      schoolEmail: schoolEmail.toLowerCase().trim(),
      schoolPassword: hashedPassword,
      schoolID,
    });
    const userToken = jwt.sign(
      { id: data.schoolID, email: data.schoolEmail },
      process.env.JWT_SECRET,
      { expiresIn: "30min" }
    );

    const verifyLink = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/school/verify/${userToken}`;
    let mailOptions = {
      email: data.schoolEmail,
      subject: "Email Verification",
      html: signUpTemplate(verifyLink, `${data.schoolName}`),
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
    const token = jwt.sign(
      {
        userId: existingSchool.schoolID,
        email: existingSchool.schoolEmail,
        name: existingSchool.schoolName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: `${existingSchool.schoolName} is logged in`,
      data: existingSchool,
      token,
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
    const { schoolID, studentID } = req.params;
    const school = await schoolModel.findById(schoolID);
    if (!school) {
      return res.status(404).json({
        status: "Not Found",
        message: "school not found",
      });
    }
    const students = school.students.find(
      (student) => student.id === studentID
    );
    if (!students) {
      return res.status(404).json({
        status: "Not Found",
        message: "student not found",
      });
    }
    res.status(200).json({
      status: "Request ok",
      message: `This is ${students.firstName} info`,
      data: students,
    });
  } catch (error) {
    es.status(500).json({
      status: "server error",
      message: error.message,
    });
  }
};
exports.getOneTeacher = async (req, res) => {
  try {
    const { schoolID, teacherID } = req.params;
    const school = await schoolModel.findById({ schoolID });
    if (!school) {
      return res.status(404).json({
        status: "Not Found",
        message: "School not found",
      });
    }
    const teachers = school.teachers.find(
      (teacher) => teacher.id === teacherID
    );

    if (!teachers) {
      return res.status(404).json({
        status: "Not Found",
        message: "Teacher not found in the specified school",
      });
    }
    return res.status(200).json({
      status: "Request ok",
      message: `This is ${teachers.firstName} info`,
      data: teachers,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const existingUser = await schoolModel.find();
    if (existingUser.length <= 0) {
      return res.status(404).json({
        status: "Not found",
        message: `No available existingUser`,
      });
    } else {
      res.status(200).json({
        status: "OK",
        message: `Kindly find the ${existingUser.length} registered teachers & students below`,
        data: existingUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { studentID } = req.params;
    const existingUser = await schoolModel.findOne({ studentID });
    if (!existingUser) {
      return res.status(404).json({
        status: "Not found",
        messgae: "Student not found",
      });
    }
    res.status(200).json({
      status: "OK",
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "server error",
      message: error.message,
    });
  }
};
exports.deleteTeacher = async (req, res) => {
  try {
    const { teacherID } = req.params;
    const existingUser = await schoolModel.findOne({ teacherID });
    if (!existingUser) {
      return res.status(404).json({
        status: "Not found",
        messgae: "Teacher not found",
      });
    }
    res.status(200).json({
      status: "OK",
      message: "Teacher deleted successfully",
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
    const { schoolEmail } = jwt.verify(token, process.env.JWT_SECRET);
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
