const attendanceModel = require('../models/attendanceModel');
const {sendAttendanceEmail} = require('../helpers/email');
const studentModel = require('../models/studentModel');
const date = new Date();

exports.takeAttendance = async (req, res) => {
    try {
        const { teacherID, schoolID, studentAttendance } = req.body;

        const today = new Date().setHours(0, 0, 0, 0);
        let attendance = await attendanceModel.findOne({
            teachers: teacherID,
            school: schoolID,
            date: today
        });

        if (attendance) {
            return res.status(400).json({ message: 'Attendance has already been taken for today' });
        }

        attendance = new attendanceModel({
            teachers: teacherID,
            school: schoolID,
            students: studentAttendance
        });

        await attendance.save();
        for (const record of studentAttendance) {
            if (record.status === 'absent' || record.status === 'late') {
                const student = await studentModel.findById(record.student);
                if (student) {
                    await sendAttendanceEmail(student, record.status, schoolID);
                }
            }
        }
        res.status(200).json({ message: 'Attendance taken successfully', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
