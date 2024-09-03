const attendanceModel = require('../models/attendanceModel')
const sendAttendanceNotification = require('../helpers/email')
const{generateEmailContent}= require('../helpers/template')
const studentModel = require('../models/studentModel')
const date = new Date


exports.takeAttendance = async (req, res) => {
    try {
        const { teacherId, schoolId, studentAttendance } = req.body;

        const today = new Date().setHours(0, 0, 0, 0);
        let attendance = await attendanceModel.findOne({
            teacher: teacherId,
            school: schoolId,
            date: today
        });

        if (attendance) {
            return res.status(400).json({ message: 'Attendance has already been taken for today' });
        }

        attendance = new Attendance({
            teacher: teacherId,
            school: schoolId,
            students: studentAttendance
        });

        await attendance.save();

        // Send emails for absent or late students
        for (const record of studentAttendance) {
            if (record.status === 'absent' || record.status === 'late') {
                const student = await Student.findById(record.student);
                if (student) {
                    await sendAttendanceEmail(student, record.status);
                }
            }
        }

        res.status(200).json({ message: 'Attendance taken successfully', attendance });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
