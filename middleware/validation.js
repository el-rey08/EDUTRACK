const joiValidation = require("@hapi/joi");
const studentModel = require('../models/studentModel')

exports.singUpVlidator = async (req, res, next) => {
  const Schema = joiValidation.object({
    fullName: joiValidation.string().required().min(3).trim().regex(/^[A-Za-z]+(?:[-' ]?[A-Za-z]+)*$/).messages({
      "any.required": "Please provide fullName",
      "string.empty": "FullName cannot be empty",
      "string.min": "The minimum name must be at least 3 characters long",
      "string.pattern.base": "Full name should only contain letters, spaces, hyphens, or apostrophes",
    }),
    
    email: joiValidation
    .string()
    .email()
    .min(7)
    .required()
    .messages({
      "any.required": "please provide your email address",
      "string.empty": "email cannot be empty",
      "string.email":
        "invalid email format. please enter a valid email address",
    }),

      class: joiValidation.string()
    .required()
    .pattern(/^(Primary [1-6]|JSS [1-3]|SS [1-3])$/)
    .messages({
      'string.pattern.name': 'Class must be one of the following: JSS 1-3, or SS 1-3.',
      'any.required': 'Class is required.'
    }),
    studentProfile:joiValidation.string(),
      address:joiValidation.string().required(),
        gender:joiValidation.string().required().valid("male","female"),
        
      })
      
        const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  next();
};
  


exports.logInValidator = async (req, res, next) => {
  const { email, studentID } = req.body;

  try {
    // Validate email
    const emailSchema = joiValidation.object({
      email: joiValidation.string().email().lowercase().required().messages({
        "any.required": "Please provide your email address",
        "string.empty": "Email cannot be empty",
        "string.email": "Invalid email format. Please enter a valid email address",
      }),
    });

    const { error: emailError } = emailSchema.validate({ email });
    if (emailError) {
      return res.status(400).json({
        message: emailError.details[0].message,
      });
    }
    if (!studentID) {
      return res.status(400).json({
        message: "Please enter your studentID",
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


