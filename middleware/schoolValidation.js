const joiValidation = require('@hapi/joi')
exports.signUpValidation = async (req, res, next)=> {
    const Schema = joiValidation.object({
        schoolName:joiValidation
        .string()
      .required()
      .min(3)
      .trim()
      .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
      .messages({
        "any.required": "please provide school name",
        "string.empty": "school name cannot be empty",
        "string.min": "the minium name must be at least 3 character long",
        "string.pattern.base": "school name should only contain letters",
      }),
      schoolAddress:joiValidation.string().required(),
      schoolPhone:joiValidation.string().regex(/^\d{11}$/).message('Phone number must be exactly 11 digits'),
      schoolEmail:joiValidation
      .string()
    .email()
    .min(7)
    .required()
    .messages({
      "any.required": "please provide school email address",
      "string.empty": "email cannot be empty",
      "string.email":
        "invalid email format. please enter a valid email address",
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
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        "string.empty": "Password cannot be empty",
      }),

    })
    const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  next();
}

exports.logInValidator = async (req, res, next) => {
    const Schema = joiValidation.object({
      schoolEmail: joiValidation.string().email().min(7).required().messages({
        "any.required": "please provide school email address",
        "string.empty": "email cannot be empty",
        "string.email":"invalid email format. please enter a valid email address",
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
          "any.required":"please enter school password",
          "string.pattern.base":"Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
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
  