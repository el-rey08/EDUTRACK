const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  message: { type: String },
  sentAt: { type: Date, default: Date.now },
});
const NotificationModel = mongoose.model("Notification", notificationSchema);
module.exports = NotificationModel;
