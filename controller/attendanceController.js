const attendanceModel = require('../models/attendanceModel'); // Adjust the path if necessary
const {sendAttendanceEmail} = require('../helpers/email'); // Email function to send notifications
const studentModel = require('../models/studentModel'); // Model for student data
const date = new Date(); // Current date

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

        attendance = new attendanceModel({
            teacher: teacherId,
            school: schoolId,
            students: studentAttendance
        });

        await attendance.save();

        // Send emails for absent or late students
        for (const record of studentAttendance) {
            if (record.status === 'absent' || record.status === 'late') {
                const student = await studentModel.findById(record.student);
                if (student) {
                    await sendAttendanceEmail(student, record.status, schoolId); // Added schoolId to pass to the email function
                }
            }
        }
        res.status(200).json({ message: 'Attendance taken successfully', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
