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
    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        attendanceRecords: [
          {
            week: {
              type: Number,
              required: true,
            },
            days: {
              Monday: {
                type: String,
                enum: ["present", "absent", "late"],
              },
              Tuesday: {
                type: String,
                enum: ["present", "absent", "late"],
              },
              Wednesday: {
                type: String,
                enum: ["present", "absent", "late"],
              },
              Thursday: {
                type: String,
                enum: ["present", "absent", "late"],
              },
              Friday: {
                type: String,
                enum: ["present", "absent", "late"],
              },
            },
          },
        ],
      },
    ],
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
