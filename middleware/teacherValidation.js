const joiValidation = require('@hapi/joi');
const teacherModel = require('../models/teachearModel')

// Sign-up Validation
exports.singUpVlidator = async (req, res, next) => {
  const Schema = joiValidation.object({
    fullName: joiValidation.string().required().min(3).trim().regex(/^[A-Za-z]+(?:[-' ]?[A-Za-z]+)*$/).messages({
      "any.required": "Please provide fullName",
      "string.empty": "FullName cannot be empty",
      "string.min": "The minimum name must be at least 3 characters long",
      "string.pattern.base": "Full name should only contain letters, spaces, hyphens, or apostrophes",
    }),
    email: joiValidation.string().email().lowercase().min(7).required().messages({
      "any.required": "Please provide your email address",
      "string.empty": "Email cannot be empty",
      "string.email": "Invalid email format. Please enter a valid email address",
    }),
    address: joiValidation.string().required(),
    gender: joiValidation.string().required().valid("male", "female"),
    maritalStatus: joiValidation.string().required().pattern(/\b(married|single|divorce[sd]?)\b/i).messages({
      'string.pattern.base': 'Marital status must be either "married", "single", or "divorced".',
      'any.required': 'Marital status is required.',
    }),
    teacherClass: joiValidation.string()
      .required()
      .pattern(/^(Primary [1-6]|JSS [1-3]|SS [1-3])$/)
      .messages({
        'string.pattern.base': 'Class must be one of the following: JSS 1-3, or SS 1-3.',
        'any.required': 'Class is required.'
      }),
  });

  const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  next();
};

// Login Validation
exports.logInValidator = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const teacher = await teacherModel.findOne({ email: email.toLowerCase() });  // Ensure email is lowercase for comparison

    if (!teacher) {
      return res.status(404).json({
        status: "Not found",
        message: "Teacher not found",
      });
    }

    // Allow login with teacherID as the password
    if (password === teacher.teacherID.toString()) {
      return next();
    }

    // Simplified password validation at login
    const Schema = joiValidation.object({
      email: joiValidation.string().email().lowercase().min(7).required().messages({
        "any.required": "Please provide your email address",
        "string.empty": "Email cannot be empty",
        "string.email": "Invalid email format. Please enter a valid email address",
      }),
      password: joiValidation
        .string()
        .required()
        .min(4)
        .max(50)
        .messages({
          "any.required": "Please enter password",
          "string.empty": "Password cannot be empty",
          "string.min": "Password must be at least 4 characters long",
          "string.max": "Password cannot be longer than 50 characters",
        }),
    });

    const { error } = Schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      message: error.message,
    });
  }
};
