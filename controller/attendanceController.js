const attendanceModel = require("../models/attendanceModel");
const { sendAttendanceEmail } = require("../helpers/email");
const studentModel = require("../models/studentModel");
const schoolModel = require("../models/schoolModel");

exports.takeAttendance = async (req, res) => {
  try {
    const { teacherID, schoolID, studentAttendance, week, day } = req.body;
    const school = await schoolModel.findById(schoolID);
    if (!school) {
      return res.status(400).json({ message: "School not found" });
    }

    const schoolName = school.schoolName;
    const attendanceResults = [];

    for (const record of studentAttendance) {
      const student = await studentModel.findById(record.student);
      if (!student) {
        return res.status(400).json({ message: `Student not found: ${record.student}` });
      }

      let attendance = await attendanceModel.findOne({
        teacher: teacherID,
        school: schoolID,
        student: record.student,
        "attendanceRecords.week": week,
      });

      if (!attendance) {
        // Create new attendance record if not found
        attendance = new attendanceModel({
          teacher: teacherID,
          school: schoolID,
          student: record.student,
          studentName: student.fullName,
          attendanceRecords: [
            {
              week: week,
              days: {
                [day]: record.status,
              },
            },
          ],
        });
      } else {
        // Update existing attendance record
        const weekRecord = attendance.attendanceRecords.find(
          (w) => w.week === week
        );

        if (weekRecord) {
          weekRecord.days[day] = record.status;
        } else {
          attendance.attendanceRecords.push({
            week: week,
            days: {
              [day]: record.status,
            },
          });
        }
      }

      await attendance.save();

      // Notify parents if the student is absent or late
      if (record.status === "absent" || record.status === "late") {
        if (student.parentEmail) {
          await sendAttendanceEmail(student, record.status, schoolName, day);
        }
      }

      // Add the saved attendance record to the results
      const savedRecord = attendance.attendanceRecords.find((w) => w.week === week);

      attendanceResults.push({
        studentName: student.fullName,
        week: savedRecord.week,
        days: savedRecord.days,
      });
    }

    res.status(200).json({
      message: "Attendance taken successfully",
      data: attendanceResults,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




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
    const studentAttendance = attendanceRecords.map((attendance) => ({
      studentName: attendance.studentName,
      week: attendance.attendanceRecords.map((record) => ({
        week: record.week,
        days: record.days,
      })),
    }));
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
    const formattedAttendance = attendanceRecords.map((record) => ({
      teacher: record.teacher.fullName,
      date: record.date,
      studentName: record.studentName,
      attendanceRecords: record.attendanceRecords.map((att) => ({
        week: att.week,
        days: att.days,
      })),
    }));
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
