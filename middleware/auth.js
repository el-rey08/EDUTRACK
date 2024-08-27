const jwt = require("jsonwebtoken");
const schoolModel = require("../models/schoolModel");
require("dotenv").config();
// const authenticate = async (req, res, next) => {
//   try {
//     const auth = req.headers.authorization;
//     if (!auth) {
//       return res.status(401).json({
//         message: "Authorization required",
//       });
//     }
//     const token = auth.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({
//         status: "Unauthorized",
//         message: "No token provided",
//       });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const school = await schoolModel.findById(decoded.userId);
//     if (!school) {
//       return res.status(403).json({
//         status: "Forbidden",
//         message: "Access denied. You are not a principal",
//       });
//     }

//     req.user = decoded;

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       status: "Unauthorized",
//       message: "Invalid or expired token",
//     });
//   }
// };

// const schoolAdmin = (req, res, next) => {
//   if (req.user && req.user === 'school') {
//     return next();
//   } else {
//     return res.status(403).json({
//       status: 'Forbidden',
//       message: 'Access denied. You are not the school admin',
//     });
//   }
// };



const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ message: "Authorization required" });
    }

    const token = auth.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log('Decoded JWT:', req.user);  // Log to verify the token content

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const checkAdminOrTeacher = async (req, res, next) => {
  try {
    const user = await schoolModel.findById(req.user.userId);

    console.log('User retrieved:', user);
    
    if (user && (user.role === 'admin' || user.role === 'teacher')) {
      // If the user is either an admin or a teacher, allow them to proceed
      next();
    } else {
      // If the user is neither an admin nor a teacher, deny access
      return res.status(403).json({
        status: "Forbidden",
        message: "Access denied. You are not authorized to perform this action",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



const checkAdmin = async (req, res, next) => {
  try {
    const user = await schoolModel.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: "Forbidden",
        message: "Access denied. You must be a teacher to perform this action",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "An error occurred while checking teacher status",
    });
  }
}; 

module.exports = {
  authenticate,
  checkAdminOrTeacher,
  checkAdmin

  //   schoolAdmin,
};
