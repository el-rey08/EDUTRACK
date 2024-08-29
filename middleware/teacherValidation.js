const joiValidation = require('@hapi/joi')
exports.singUpVlidator = async (req, res, next) => {
  console.log("Incoming data:", req.body); // Log req.body before validation

  const Schema = joiValidation.object({
    firstName: joiValidation.string().required().min(3).trim().regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/).messages({
      "any.required": "please provide firstName",
      "string.empty": "firstName cannot be empty",
      "string.min": "the minimum name must be at least 3 characters long",
      "string.pattern.base": "first name should only contain letters",
    }),
    lastName: joiValidation.string().required().min(3).trim().regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/).messages({
      "any.required": "please provide lastName",
      "string.empty": "lastName cannot be empty",
      "string.min": "the minimum name must be at least 3 characters long",
      "string.pattern.base": "last name should only contain letters",
    }),
    surnName: joiValidation.string().required().min(3).trim().regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/).messages({
      "any.required": "please provide surnName",
      "string.empty": "surnName cannot be empty",
      "string.min": "the minimum name must be at least 3 characters long",
      "string.pattern.base": "surname should only contain letters",
    }),
    email: joiValidation.string().email().min(7).required().messages({
      "any.required": "please provide your email address",
      "string.empty": "email cannot be empty",
      "string.email": "invalid email format. please enter a valid email address",
    }),
    password: joiValidation.string().required().min(8).max(50).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,50}$/
    ).messages({
      "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      "string.empty": "Password cannot be empty",
    }),
    address: joiValidation.string().required(),
    gender: joiValidation.string().required().valid("male", "female"),
    phoneNumber: joiValidation.string().regex(/^\d{11}$/).message('Phone number must be exactly 11 digits'),
    state: joiValidation.string().required().regex(/^[A-Za-z]+$/),
    maritalStatus: joiValidation.string().required().pattern(/\b(married|single|divorce[sd]?)\b/i).messages({
      'string.pattern.base': 'Marital status must be either "married", "single", or "divorced".',
      'any.required': 'Marital status is required.',
    }),
    schoolID: joiValidation.number().integer() // Ensure this is present and correct
  });

  const { error } = Schema.validate(req.body);
  if (error) {
    console.log("Validation error:", error.details); // Log any validation error details
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  console.log("Validation passed"); // Log when validation passes
  next();
};

  


exports.logInValidator = async (req, res, next) => {
  const Schema = joiValidation.object({
    email: joiValidation.string().email().min(7).required().messages({
      "any.required": "please provide your email address",
      "string.empty": "email cannot be empty",
      "string.email":"invalid email format. please enter a valid email address",
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
