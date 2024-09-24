const attendanceModel = require("../models/attendanceModel");
const { sendAttendanceEmail } = require("../helpers/email");
const studentModel = require("../models/studentModel");
const teacherModel = require("../models/teachearModel");
const schoolModel = require("../models/schoolModel");

exports.takeAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    const { studentID } = req.params;
    const userID = req.user.userId;
    const userRole = req.user.role; 
    let schoolID;
    let schoolName;
    
    if (userRole === 'teacher') {
      const teacher = await teacherModel.findById(userID);
      if (!teacher) {
        return res.status(400).json({ message: "Teacher not found" });
      }
      schoolID = teacher.school._id;
      schoolName = teacher.school.schoolName;
    } else if (userRole === 'admin') {
      const School = await schoolModel.findById(userID);
      if (!School) {
        return res.status(400).json({ message: "Admin not found" });
      }
      schoolID = School._id;
      schoolName = School.schoolName;
    } else {
      return res.status(403).json({ message: "Unauthorized user" });
    }
    const currentDate = new Date();
    const week = getWeekNumber(currentDate);
    const dayNames = [
      "sunday", 
      "monday", 
      "tuesday", 
      "wednesday", 
      "thursday", 
      "friday", 
      "saturday"];
    const day = dayNames[currentDate.getDay()];
  
    if (day === "saturday" || day === "sunday") {
      return res.status(400).json({
        message: "Attendance cannot be taken today (Saturday or Sunday)",
      });
    }

    const student = await studentModel.findById(studentID);
    if (!student) {
      return res.status(400).json({ message: `Student not found: ${studentID}` });
    }

    let attendance = await attendanceModel.findOne({
      school: schoolID,
      student: studentID,
      "attendanceRecords.week": week,
    });

    if (attendance) {
      const weekRecord = attendance.attendanceRecords.find((w) => w.week === week);
      if (weekRecord && weekRecord.days && weekRecord.days[day]) {
        return res.status(400).json({
          message: `Attendance has already been taken for ${day}`,
        });
      }
      if (weekRecord) {
        weekRecord.days[day] = status;
      } else {
        attendance.attendanceRecords.push({
          week: week,
          days: {
            [day]: status,
          },
        });
      }
    } else {
      attendance = new attendanceModel({
        teacher: userID,
        school: schoolID,
        student: studentID,
        studentName: student.fullName,
        attendanceRecords: [
          {
            week: week,
            days: {
              [day]: status,
            },
          },
        ],
      });
    }
    await attendance.save();

    if (status === "absent" && student.email) {
      await sendAttendanceEmail(student, status, schoolName, day);
    }

    res.status(200).json({
      message: "Attendance taken successfully",
      data: {
        studentName: student.fullName,
        week: week,
        days: attendance.attendanceRecords.find((w) => w.week === week).days,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

function getWeekNumber(date) {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startDate.getDay() + 1) / 7);
}

exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentID } = req.params;
    const student = await studentModel.findById(studentID);
    if (!student) {
      return res.status(404).json({
        status: "Not Found",
        message: "Student Not Found",
      });
    }
    const attendanceRecords = await attendanceModel.find({ student: studentID });
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Student Attendance Record not Found",
      });
    }
    const studentAttendance = attendanceRecords.map((attendance) => {
      return {
        studentName: student.fullName, 
        attendanceRecords: attendance.attendanceRecords.map((record) => {
          const days = record.days || {};
          const populatedDays = Object.keys(days).length > 0 ? days : {
            Monday: null,
            Tuesday: null,
            Wednesday: null,
            Thursday: null,
            Friday: null,
          };

          return {
            week: record.week,
            days: populatedDays,
          };
        }),
      };
    });
    res.status(200).json({
      status: "OK",
      message: "Student Attendance Retrieved Successfully",
      data: studentAttendance,
    });
  } catch (error) {
    res.status(500).json({
      status: "Server Error",
      message: error.message,
    });
  }
};


exports.myAttendance = async (req, res) => {
  try {
    const { userId } = req.user;
    const student = await studentModel.findById(userId);
    if (!student) {
      return res.status(404).json({
        status: "Not Found",
        message: "Student Not Found",
      });
    }
    const attendanceRecords = await attendanceModel.find({ student: userId});
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Student Attendance Record not Found",
      });
    }
    const studentAttendance = attendanceRecords.map((attendance) => {
      return {
        studentName: student.fullName, 
        attendanceRecords: attendance.attendanceRecords.map((record) => {
          const days = record.days || {};
          const populatedDays = Object.keys(days).length > 0 ? days : {
            Monday: null,
            Tuesday: null,
            Wednesday: null,
            Thursday: null,
            Friday: null,
          };

          return {
            week: record.week,
            days: populatedDays,
          };
        }),
      };
    });
    res.status(200).json({
      status: "OK",
      message: "Student Attendance Retrieved Successfully",
      data: studentAttendance,
    });
  } catch (error) {
    res.status(500).json({
      status: "Server Error",
      message: error.message,
    });
  }
};


exports.getAllStudentAttendance = async (req, res) => {
  try {
    const { schoolID } = req.params;
    const attendanceRecords = await attendanceModel.find({ school: schoolID });
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "No Attendance Record Found for this school",
      });
    }
    const formattedAttendance = attendanceRecords.map((record) => {
      return {
        teacher: record.teacher,
        date: record.date,
        studentName: record.studentName,
        attendanceRecords: record.attendanceRecords.map((att) => {
          const days = att.days || {};
          const populatedDays = Object.keys(days).length > 0 ? days : {
            Monday: null,
            Tuesday: null,
            Wednesday: null,
            Thursday: null,
            Friday: null,
          };

          return {
            week: att.week,
            days: populatedDays,
          };
        }),
      };
    });
    res.status(200).json({
      status: "OK",
      message: "School attendance records retrieved successfully",
      data: formattedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      status: "Server Error",
      message: error.message,
    });
  }
};
