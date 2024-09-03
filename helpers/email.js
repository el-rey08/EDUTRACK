const nodeMailer = require("nodemailer");

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



const sendAttendanceEmail = (students, status, shoolName) => {
    const transporter = nodeMailer.createTransport({
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
    message = `Hello, your child ${students.fullName} is marked absent today.`;
  } else if (status === "late") {
    subject = "Attendance Notification: Late Arrival";
    message = `Hello, your child ${students.fullName} arrived late to school today.`;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
    
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            .header {
                background-color: #003B31;
                padding: 20px;
                text-align: center;
                color: #ffffff;
            }
    
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
    
            .content {
                padding: 20px;
                font-size: 16px;
                line-height: 1.6;
            }
    
            .footer {
                background-color: #003B31;
                padding: 10px;
                text-align: center;
                color: #ffffff;
                font-size: 14px;
            }
    
            /* Media Queries */
            @media only screen and (max-width: 1200px) {
                /* For desktops with screen width less than 1200px */
                .container {
                    width: 90%;
                    padding: 15px;
                }
    
                .content {
                    font-size: 15px;
                }
    
                .header h1 {
                    font-size: 22px;
                }
            }
    
            @media only screen and (max-width: 768px) {
                /* For tablets with screen width less than 768px */
                .container {
                    width: 95%;
                    padding: 10px;
                }
    
                .content {
                    font-size: 14px;
                }
    
                .header h1 {
                    font-size: 20px;
                }
            }
    
            @media only screen and (max-width: 480px) {
                /* For phones with screen width less than 480px */
                .container {
                    width: 100%;
                    padding: 5px;
                }
    
                .content {
                    font-size: 13px;
                }
    
                .header h1 {
                    font-size: 18px;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="header">
                <h1>${subject}</h1>
            </div>
            <div class="content">
                <p>Dear Parent,</p>
                <p>${message}</p>
                <p>If you have any questions, please contact the school office.</p>
                <p>Best regards,<br>Your School Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 ${shoolName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    
    </html>
  `;

  const mailOptions = {
    from: process.env.MAIL_ID,
    to: students.email,
    subject: subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendAttendanceEmail, sendMail };
