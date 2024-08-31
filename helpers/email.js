const nodeMailer = require("nodemailer")

require ("dotenv").config()

const sendMail = async (options)=>{

const transporter = await nodeMailer.createTransport(
    {    
     secure: true,
      service :  process.env.SERVICE,
     
 auth: {
          user:process.env.MAIL_ID,
          pass:process.env.MAIL_PASSWORD,
        },
      }
    
)


let mailOptions = {
    from: process.env.MAIL_ID,
    to: options.email,
    subject: options.subject,
  html:options.html 
}
  await transporter.sendMail(mailOptions)

}


const transporter = nodeMailer.createTransport({
    secure: true,
     service :  process.env.SERVICE,
    
auth: {
         user:process.env.MAIL_ID,
         pass:process.env.MAIL_PASSWORD,
       },

})

const sendAttendanceNotification = async (email, childName, status) => {
  const emailContent = generateEmailContent(childName, status);

  const mailOptions = {
    from: process.env.MAIL_ID,
    to: email,
    subject: `Attendance Update for ${childName}`,
    html: emailContent
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

module.exports = {sendAttendanceNotification, sendMail}
