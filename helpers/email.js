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

module.exports = sendMail

// const generateEmailContent = (childName, status) => {
//   let message;
//   let statusClass;

//   switch (status) {
//     case 'present':
//       message = `${childName} is present at school today.`;
//       statusClass = 'present';
//       break;
//     case 'absent':
//       message = `${childName} is absent from school today.`;
//       statusClass = 'absent';
//       break;
//     case 'left early':
//       message = `${childName} left school before the closing hour.`;
//       statusClass = 'left-early';
//       break;
//     case 'not in school':
//       message = `${childName} did not attend school today.`;
//       statusClass = 'not-in-school';
//       break;
//     default:
//       message = `Status of ${childName} is unknown.`;
//       statusClass = '';
//   }

//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Attendance Notification</title>
//         <style>
//             body {
//                 font-family: Arial, sans-serif;
//                 background-color: #f4f4f4;
//                 color: #333;
//                 margin: 0;
//                 padding: 0;
//                 line-height: 1.6;
//             }
//             .container {
//                 max-width: 600px;
//                 margin: 20px auto;
//                 background-color: #ffffff;
//                 padding: 20px;
//                 border-radius: 8px;
//                 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//             }
//             h1 {
//                 color: #333;
//                 font-size: 24px;
//                 margin-bottom: 20px;
//                 text-align: center;
//             }
//             p {
//                 margin: 0 0 10px;
//             }
//             .status {
//                 font-weight: bold;
//                 color: #ff6b6b;
//             }
//             .status.present {
//                 color: #4caf50;
//             }
//             .status.absent {
//                 color: #f44336;
//             }
//             .status.left-early {
//                 color: #ff9800;
//             }
//             .status.not-in-school {
//                 color: #9c27b0;
//             }
//             .footer {
//                 margin-top: 30px;
//                 text-align: center;
//                 font-size: 12px;
//                 color: #777;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <h1>Attendance Notification</h1>
//             <p>Dear Parent,</p>
//             <p class="status ${statusClass}">${message}</p>
//             <p>Please contact the school if you have any questions.</p>
//             <div class="footer">
//                 <p>Best regards,<br />School Administration</p>
//             </div>
//         </div>
//     </body>
//     </html>
//   `;
// };


// const transporter = nodeMailer.createTransport({
//     secure: true,
//      service :  process.env.SERVICE,
    
// auth: {
//          user:process.env.MAIL_ID,
//          pass:process.env.MAIL_PASSWORD,
//        },

// })

// const sendAttendanceNotification = async (email, childName, status) => {
//   const emailContent = generateEmailContent(childName, status);

//   const mailOptions = {
//     from: process.env.MAIL_ID,
//     to: email,
//     subject: `Attendance Update for ${childName}`,
//     html: emailContent
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error(`Error sending email: ${error.message}`);
//   }
// };

// module.exports = sendAttendanceNotification
