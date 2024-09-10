const joiValidation = require('@hapi/joi');

// Sign-up Validation
exports.signUpValidation = async (req, res, next) => {
  const Schema = joiValidation.object({
    schoolName: joiValidation
      .string()
      .required()
      .min(3)
      .trim()
      .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
      .messages({
        "any.required": "Please provide school name",
        "string.empty": "School name cannot be empty",
        "string.min": "The minimum name must be at least 3 characters long",
        "string.pattern.base": "School name should only contain letters",
      }),
    schoolAddress: joiValidation.string().required().messages({
      "any.required": "Please provide school address",
      "string.empty": "School address cannot be empty",
    }),
    schoolEmail: joiValidation
      .string()
      .email()
      .lowercase()
      .min(7)
      .required()
      .messages({
        "any.required": "Please provide school email address",
        "string.empty": "Email cannot be empty",
        "string.email": "Invalid email format. Please enter a valid email address",
      }),
    schoolPassword: joiValidation
      .string()
      .required()
      .min(8)
      .max(50)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,50}$/
      )
      .messages({
        "any.required": "Please enter school password",
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        "string.empty": "Password cannot be empty",
        "string.min": "Password must be at least 8 characters long",
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
};

// Login Validation
exports.logInValidator = async (req, res, next) => {
  const Schema = joiValidation.object({
    schoolEmail: joiValidation
      .string()
      .email()
      .lowercase()
      .min(7)
      .required()
      .messages({
        "any.required": "Please provide school email address",
        "string.empty": "Email cannot be empty",
        "string.email": "Invalid email format. Please enter a valid email address",
      }),
    schoolPassword: joiValidation
      .string()
      .required()
      .min(8)
      .max(50)
      .messages({
        "any.required": "Please enter school password",
        "string.empty": "Password cannot be empty",
        "string.min": "Password must be at least 8 characters long",
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
};
