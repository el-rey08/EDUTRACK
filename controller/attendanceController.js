const attendanceModel = require("../models/attendanceModel");
const { sendAttendanceEmail } = require("../helpers/email");
const studentModel = require("../models/studentModel");
const teacherModel = require("../models/teachearModel");
// const schoolModel = require("../models/schoolModel");

exports.takeAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    const { studentID } = req.params;
    const teacherID = req.user.userId;
    const teacher = await teacherModel.findById(teacherID).populate("school");
    if (!teacher) {
      return res.status(400).json({ message: "Teacher not found" });
    }
    const schoolID = teacher.school._id;
    const schoolName = teacher.school.schoolName;
    const currentDate = new Date();
    const week = getWeekNumber(currentDate);
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const day = dayNames[currentDate.getDay()];
    const student = await studentModel.findById(studentID);
    if (!student) {
      return res
        .status(400)
        .json({ message: `Student not found: ${studentID}` });
    }
    let attendance = await attendanceModel.findOne({
      teacher: teacherID,
      school: schoolID,
      student: studentID,
      "attendanceRecords.week": week,
    });

    if (!attendance) {
      attendance = new attendanceModel({
        teacher: teacherID,
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
    } else {
      const weekRecord = attendance.attendanceRecords.find(
        (w) => w.week === week
      );

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
    }
    await attendance.save();
    if (status === "absent" || status === "late") {
      if (student.email) {
        await sendAttendanceEmail(student, status, schoolName, day);
      }
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
    const attendanceRecords = await attendanceModel.find({
      student: studentID,
    });
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Student Attendance Record not Found",
      });
    }
    const studentAttendance = attendanceRecords.map((attendance) => {
      if (!attendance.attendanceRecords) {
        console.error("Missing attendanceRecords:", attendance);
        return {
          studentName: attendance.studentName,
          attendanceRecords: [],
        };
      }
      return {
        studentName: attendance.studentName,
        attendanceRecords: attendance.attendanceRecords.map((record) => {
          if (!record.days) {
            return {
              week: record.week,
              days: {},
            };
          }
          const daysObject = Object.fromEntries(
            record.days.entries ? record.days.entries() : []
          );
          return {
            week: record.week,
            days: daysObject,
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
    const attendanceRecords = await attendanceModel
      .find({ school: schoolID })

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "No Attendance Record Found for this school",
      });
    }
    const formattedAttendance = attendanceRecords.map((record) => {
      if (!record.attendanceRecords) {
        return {
          teacher: record.teacher,
          date: record.date,
          studentName: record.studentName,
          attendanceRecords: [],
        };
      }

      return {
        teacher: record.teacher,
        date: record.date,
        studentName: record.studentName,
        attendanceRecords: record.attendanceRecords.map((att) => {
          if (!att.days) {
            return {
              week: att.week,
              days: {},
            };
          }
          const daysObject = Object.fromEntries(
            att.days.entries ? att.days.entries() : []
          );

          return {
            week: att.week,
            days: daysObject,
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
