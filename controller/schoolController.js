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
    return Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit ID
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

    // Validate required fields
    if (!schoolName || !schoolType || !schoolAddress || !schoolPhone || !schoolEmail || !schoolPassword) {
      return res.status(400).json({
        status: "Bad Request",
        message: "All fields are required",
      });
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(schoolEmail)) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Invalid email format",
      });
    }

    // Check for existing school
    const existingSchool = await schoolModel.findOne({ schoolEmail });
    if (existingSchool) {
      return res.status(400).json({
        status: "Bad Request",
        message: "This school already exists",
      });
    }

    // Hash password
    const saltedPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(schoolPassword, saltedPassword);
    let schoolID = generateID();

    // Create new school record
    const newData = new schoolModel({
      schoolName,
      schoolType,
      schoolAddress,
      schoolPhone,
      schoolEmail: schoolEmail.toLowerCase().trim(),
      schoolPassword: hashedPassword,
      schoolID,
    });

    // Generate verification token
    const userToken = jwt.sign(
      { id: newData.schoolID, email: newData.schoolEmail },
      process.env.JWT_SECRET,
      { expiresIn: "30min" }
    );

    // Prepare verification email
    const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/school/verify/${userToken}`;
    let mailOptions = {
      email: newData.schoolEmail,
      subject: "Email Verification",
      html: signUpTemplate(verifyLink, `${newData.schoolName}`),
    };
    // Save school and send verification email
    await newData.save();
    await sendMail(mailOptions);

    res.status(201).json({
      status: "ok",
      message: "Registration complete. Please verify your email.",
      newData,
      userToken
    
      
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
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "server error",
      message: error.message,
    });
  }
};

// exports.getOneStudent = async (req, res) => {
//   try {
//     const { studentID } = req.body;
//     const { schoolID } = req.user;
//     const school = await schoolModel.findOne({schoolID});
//     if (!school) {
//       return res.status(404).json({
//         status: "Not Found",
//         message: "student not found",
//       });
//     }
//     // const students = school.students.find(
//     //   (student) => student._id === studentID
//     // );
//     // if (!students) {
//     //   return res.status(404).json({
//     //     status: "Not Found",
//     //     message: "student not found",
//     //   });
//     // }

//     const student = await 
//     res.status(200).json({
//       status: "Request ok",
//       message: `This is ${students.firstName} info`,
//       data: students,
//     });
//   } catch (error) {
//     es.status(500).json({
//       status: "server error",
//       message: error.message,
//     });
//   }
// };

exports.getOneStudent = async (req,res)=>{
 try {
  const {studentID} = req.body
  const getOne= await studentModel.findOne({studentID})
  if(!getOne){
    return res.status(404).json({message:'student not found or registered'})
  }
  return res.status(200).json({message:'below is the student you request for',data:getOne})
  
 } catch (error) {
  res.status(500).json(error.message)
 }
}

// exports.getOneTeacher = async (req, res) => {
//   try {
//     const { teacherID } = req.params;
//     const { schoolID } = req.user;

//     const school = await schoolModel.findOne({ schoolID });
//     if (!school) {
//       return res.status(404).json({
//         status: "Not Found",
//         message: "School not found",
//       });
//     }
//     const teachers = school.teachers.find(
//       (teacher) => teacher._id === teacherID
//     );

//     if (!teachers) {
//       return res.status(404).json({
//         status: "Not Found",
//         message: "Teacher not found in the specified school",
//       });
//     }
//     return res.status(200).json({
//       status: "Request ok",
//       message: `This is ${teachers.firstName} info`,
//       data: teachers,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "Server error",
//       message: error.message,
//     });
//   }
// };

exports.getAllTeachers = async (req, res) => {
  try {
    const { schoolID } = req.user;
    const school = await schoolModel.findOne({schoolID});
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
      data: teachers,
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
    const { schoolID } = req.user;
    const school = await schoolModel.findOne({schoolID});
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
      data: students
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
    const { teacherID } = req.params;
    const { schoolID } = req.user;
    const school = await schoolModel.findOne({schoolID});
    if (!school) {
      return res.status(404).json({
        status: "Not found",
        message: "School not found",
      });
    }
    const teacherIndex = school.teachers.findIndex(teacher => teacher.id === teacherID);
    if (teacherIndex === -1) {
      return res.status(404).json({
        status: "Not found",
        message: "Teacher not found in this school",
      });
    }
    school.teachers.splice(teacherIndex, 1);
    await school.save()
    res.status(200).json({
      status: "OK",
      message: `Teacher with ID ${teacherID} has been deleted successfully`,
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
    const { studentID } = req.params;
    const { schoolID } = req.user;
    const school = await schoolModel.findOne({schoolID});
    if (!school) {
      return res.status(404).json({
        status: "Not found",
        message: "School not found",
      });
    }
    const studentIndex = school.students.findIndex(student => student._id === studentID);
    if (studentIndex === -1) {
      return res.status(404).json({
        status: "Not found",
        message: "Teacher not found in this school",
      });
    }
    school.students.splice(studentIndex, 1);
    await school.save()
    res.status(200).json({
      status: "OK",
      message: `Student with ID ${studentID} has been deleted successfully`,
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

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { schoolEmail } = req.body;
    const school = await schoolModel.findOne({ schoolEmail });
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
    const token = jwt.sign(
      { email: school.schoolEmail },
      process.env.JWT_SECRET,
      {
        expiresIn: "20mins",
      }
    );
    const verifyLink = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/school/resend-verify/${token}`;
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
      html: `please click the link to reset your password: <a href="${
        req.protocol
      }://${req.get(
        "host"
      )}/api/v1/School/reset-password/${resetToken}>Reset password</a>link expiers in 30min"`,
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
    const { token } = req.params;
    const { schoolPassword } = req.body;
    const { schoolEmail } = jwt.verify(token, process.env.JWT_SECRET);
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
