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
        sunday: {
          type: String,
          enum: ["present", "absent"],

        },
        monday: {
          type: String,
          enum: ["present", "absent"],

        },
        tuesday: {
          type: String,
          enum: ["present", "absent"],

        },
        wednesday: {
          type: String,
          enum: ["present", "absent"],

        },
        thursday: {
          type: String,
          enum: ["present", "absent"],

        },
        friday: {
          type: String,
          enum: ["present", "absent"],

        },
        saturday: {
          type: String,
          enum: ["present", "absent"],

        },
      },
    }],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
);

const attendanceModel = mongoose.model("Attendance", attendanceSchema);
module.exports = attendanceModel;
