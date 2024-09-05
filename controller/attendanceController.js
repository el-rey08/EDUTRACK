const attendanceModel = require('../models/attendanceModel');
const { sendAttendanceEmail } = require('../helpers/email');
const studentModel = require('../models/studentModel');
const schoolModel = require('../models/schoolModel');

exports.takeAttendance = async (req, res) => {
    try {
        const { teacherID, schoolID, studentAttendance } = req.body;
        const today = new Date().setHours(0, 0, 0, 0);
        const school = await schoolModel.findById(schoolID);
        if (!school) {
            return res.status(400).json({ message: 'School not found' });
        }
        const schoolName = school.schoolName;

        let attendance = await attendanceModel.findOne({
            teacher: teacherID,
            school: schoolID,
            date: today
        });

        if (attendance) {
            return res.status(400).json({ message: 'Attendance has already been taken for today' });
        }

        attendance = new attendanceModel({
            teacher: teacherID,
            school: schoolID,
            students: studentAttendance
        });

        await attendance.save();

        for (const record of studentAttendance) {
            if (record.status === 'absent' || record.status === 'late') {
                const student = await studentModel.findById(record.student);
                if (student) {
                    await sendAttendanceEmail(student, record.status, schoolName);
                }
            }
        }

        res.status(200).json({ message: 'Attendance taken successfully', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel.findById(studentID);
        if (!student) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Student Not Found',
            });
        }
        const attendance = await attendanceModel.findOne({'students.student': studentID,});
        if (!attendance) {
            return res.status(400).json({
                status: 'Bad Request',
                message: 'Student Attendance Record not Found',
            });
        }
        const studentAttendance = attendance.students.find(record => record.student.equals(studentID));
        if (!studentAttendance) {
            return res.status(404).json({
                status: 'Not Found',
                message: 'Student attendance not found',
            });
        }
        res.status(200).json({
            status: 'OK',
            message: 'Student Attendance Retrieved Successfully',
            data: studentAttendance,
        });
    } catch (error) {
        res.status(500).json({
            status: 'Server Error',
            message: error.message,
        });
    }
};

exports.getAllStudentAttendance = async (req, res)=>{
    try {
        const {schoolID}= req.params
        const attendanceRecord = await attendanceModel.find({school:schoolID})
        if(!attendanceRecord||attendanceRecord.length===0){
            return res.status(400).json({
                status:'Bad Request',
                message:'No Attendabce Record Found for this school'
            })
        }
        res.status(200).json({
            status:'OK',
            message:'school attendance record retrived',
            data:attendanceRecord
        })
    } catch (error) {
        res.status(500).json({
            status:'Server Error',
            message:error.message
        })
    }
}
