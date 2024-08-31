const mongoose = require("mongoose");
const attendanceSchema = mongoose.Schema({
  student:{ type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  studentName:{
    type:String,
    require:true
  },
  date: { type: Date, default: Date.now },
  logInTime: { type: Date },
  logOutTime: { type: Date },
  status: { type: String, enum: ["present", "absent", "late"] },
},{timestamps:true});
const attendanceModel = mongoose.model("attendance", attendanceSchema);
module.exports = attendanceModel;
