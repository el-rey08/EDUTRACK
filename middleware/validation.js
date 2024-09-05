const joiValidation = require("@hapi/joi");

exports.singUpVlidator = async (req, res, next) => {
  const Schema = joiValidation.object({
    fullName: joiValidation.string().required().min(3).trim().regex(/^[A-Za-z]+(?:[-' ]?[A-Za-z]+)*$/).messages({
      "any.required": "Please provide fullName",
      "string.empty": "FullName cannot be empty",
      "string.min": "The minimum name must be at least 3 characters long",
      "string.pattern.base": "Full name should only contain letters, spaces, hyphens, or apostrophes",
    }),
    
    // lastName: joiValidation
    //   .string()
    //   .required()
    //   .min(3)
    //   .trim()
    //   .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
    //   .messages({
    //     "any.required": "please provide lastName",
    //     "string.empty": "lastName cannot be empty",
    //     "string.min": "the minium name must be at least 3 character long",
    //     "string.pattern.base": "first name should only contain letters",
    //   }),
    // surnName: joiValidation
    //   .string()
    //   .required()
    //   .min(3)
    //   .trim()
    //   .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
    //   .messages({
    //     "any.required": "please provide surnName",
    //     "string.empty": "surnName cannot be empty",
    //     "string.min": "the minium name must be at least 3 character long",
    //     "string.pattern.base": "first name should only contain letters",
    //   }),

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

    // password: joiValidation
    //   .string()
    //   .required()
    //   .min(8)
    //   .max(50)
    //   .regex(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,50}$/
    //   )
    //   .messages({
    //     "any.required": "please password is required",
    //     "string.pattern.base":
    //       "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
    //     "string.empty": "Password cannot be empty",
    //   }),
      class: joiValidation.string()
    .required()
    .pattern(/^(Primary [1-6]|JSS [1-3]|SS [1-3])$/)
    .messages({
      'string.pattern.name': 'Class must be one of the following: JSS 1-3, or SS 1-3.',
      'any.required': 'Class is required.'
    }),
      address:joiValidation.string().required(),
        // age:joiValidator.number().required().integer(),
        gender:joiValidation.string().required().valid("male","female"),
        phoneNumber:joiValidation.string().regex(/^\d{11}$/).message('Phone number must be exactly 11 digits'),
        state:joiValidation.string().required().regex(/^[A-Za-z]+$/),
        // LGA:joiValidation.string().required().regex(/^[A-Za-z]+$/),
        dateOfBirth: joiValidation.string()
        .required()
        .pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/[0-9]{4}$/)
        .messages({
          'string.pattern.base': 'Date of birth must be in the format DD/MM/YYYY.',
          'any.required': 'Date of birth is a required field.'
      }),
      schoolID: joiValidation.number().integer()
        
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
  const Schema = joiValidation.object({
    // email: joiValidation.string().email().min(7).required().messages({
    //   "any.required": "please provide your email address",
    //   "string.empty": "email cannot be empty",
    //   "string.email":"invalid email format. please enter a valid email address",
    // }),
    studentID:joiValidation.number().integer().required(),
    password: joiValidation
      .string()
      .required()
      .min(8)
      .max(50)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,50}$/
      )
      .messages({
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
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
};
