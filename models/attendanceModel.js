const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    attendanceRecords: [{
      week: {
        type: Number,
        required: true,
      },
      days: {
        monday: {
          type: String,
          enum: ["present", "absent", "late"],
        },
        tuesday: {
          type: String,
          enum: ["present", "absent", "late"],
        },
        wednesday: {
          type: String,
          enum: ["present", "absent", "late"],
        },
        thursday: {
          type: String,
          enum: ["present", "absent", "late"],
        },
        friday: {
          type: String,
          enum: ["present", "absent", "late"],
        },
      },
    }],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const attendanceModel = mongoose.model("Attendance", attendanceSchema);
module.exports = attendanceModel;
