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

    let attendance = await attendanceModel.findOne({
      teacher: teacherID,
      school: schoolID,
      "students.attendanceRecords.week": week,
    });

    if (!attendance) {
      attendance = new attendanceModel({
        teacher: teacherID,
        school: schoolID,
        students: studentAttendance.map((student) => ({
          student: student.student,
          attendanceRecords: [
            {
              week: week,
              days: {
                [day]: student.status,
              },
            },
          ],
        })),
      });
    } else {
      for (const record of studentAttendance) {
        const studentRecord = attendance.students.find((s) =>
          s.student.equals(record.student)
        );

        if (studentRecord) {
          const weekRecord = studentRecord.attendanceRecords.find(
            (w) => w.week === week
          );
          if (weekRecord) {
            weekRecord.days[day] = record.status;
          } else {
            studentRecord.attendanceRecords.push({
              week: week,
              days: {
                [day]: record.status,
              },
            });
          }
        } else {
          attendance.students.push({
            student: record.student,
            attendanceRecords: [
              {
                week: week,
                days: {
                  [day]: record.status,
                },
              },
            ],
          });
        }
      }
    }

    await attendance.save();
    for (const record of studentAttendance) {
      if (record.status === "absent" || record.status === "late") {
        const student = await studentModel.findById(record.student);
        if (student && student.email) {
          await sendAttendanceEmail(student, record.status, schoolName, day);
        }
      }
    }

    res
      .status(200)
      .json({ message: "Attendance taken successfully", attendance });
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
      "students.student": studentID,
    });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "Student Attendance Record not Found",
      });
    }

    const studentAttendance = attendanceRecords.map((attendance) => {
      const studentRecord = attendance.students.find((record) =>
        record.student.equals(studentID)
      );

      return {
        week: studentRecord.attendanceRecords.map((record) => ({
          week: record.week,
          days: record.days,
        })),
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
    const formattedAttendance = attendanceRecords.map((record) => ({
      teacher: record.teacher.fullName,
      date: record.date,
      students: record.students.map((studentRecord) => ({
        studentName: studentRecord.student.fullName,
        attendanceRecords: studentRecord.attendanceRecords.map((att) => ({
          week: att.week,
          days: att.days,
        })),
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
