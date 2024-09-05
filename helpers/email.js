const nodeMailer = require("nodemailer");
const {generateAttendanceEmailTemplate}= require('./template')

require("dotenv").config();

const sendMail = async (options) => {
  const transporter = await nodeMailer.createTransport({
    secure: true,
    service: process.env.SERVICE,

    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.MAIL_ID,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };
  await transporter.sendMail(mailOptions);
};



const sendAttendanceEmail = async (student, status, schoolName) => {
  const transporter = await nodeMailer.createTransport({
    secure: true,
    service: process.env.SERVICE,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let subject = "";
  let message = "";

  if (status === "absent") {
    subject = "Attendance Notification: Absence";
    message = `Hello, your child ${student.fullName} is marked absent today.`;
  } else if (status === "late") {
    subject = "Attendance Notification: Late Arrival";
    message = `Hello, your child ${student.fullName} arrived late to school today.`;
  }

  // Call generateAttendanceEmailTemplate to generate the email content
  const htmlContent = generateAttendanceEmailTemplate(subject, message, schoolName);

  const mailOptions = {
    from: process.env.MAIL_ID,
    to: student.email,  // Ensure the student's email is passed correctly
    subject: subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};
module.exports = { sendAttendanceEmail, sendMail };
