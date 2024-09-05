const joiValidation = require('@hapi/joi')
const teacherModel = require('../models/teachearModel')
exports.singUpVlidator = async (req, res, next) => {
  const Schema = joiValidation.object({
    fullName: joiValidation.string().required().min(3).trim().regex(/^[A-Za-z]+(?:[-' ]?[A-Za-z]+)*$/).messages({
      "any.required": "Please provide fullName",
      "string.empty": "FullName cannot be empty",
      "string.min": "The minimum name must be at least 3 characters long",
      "string.pattern.base": "Full name should only contain letters, spaces, hyphens, or apostrophes",
    }),
    
    email: joiValidation.string().email().min(7).required().messages({
      "any.required": "please provide your email address",
      "string.empty": "email cannot be empty",
      "string.email": "invalid email format. please enter a valid email address",
    }),
    address: joiValidation.string().required(),
    gender: joiValidation.string().required().valid("male", "female"),
    maritalStatus: joiValidation.string().required().pattern(/\b(married|single|divorce[sd]?)\b/i).messages({
      'string.pattern.base': 'Marital status must be either "married", "single", or "divorced".',
      'any.required': 'Marital status is required.',
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

  


exports.logInValidator= async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const existingTeacher = await teacherModel.findOne({ email });
    if (!existingTeacher) {
      return res.status(404).json({
        status: "Not found",
        message: "Teacher not found",
      });
    }
    if (password === existingTeacher.teacherID.toString()) {
      return next();
    }
    const Schema = joiValidation.object({
      email: joiValidation.string().email().min(7).required().messages({
        "any.required": "please provide your email address",
        "string.empty": "email cannot be empty",
        "string.email": "invalid email format. please enter a valid email address",
      }),
      password: joiValidation
        .string()
        .required()
        .min(8)
        .max(50)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,50}$/
        )
        .messages({
          "any.required":"please enter password",
          "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
          "string.empty": "Password cannot be empty",
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
      status: "server error",
      message: error.message,
    });
  }
};
