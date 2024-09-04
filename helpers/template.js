const signUpTemplate = (verifyLink, firstName) => {
    return `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EDUTRACK!</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      width: 100%;
      margin: 40px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      background-color: #fff;
    }
    .header {
      background: #003B31;
      padding: 10px;
      text-align: center;
      border-bottom: 1px solid #ddd;
      color: #fff;
    }
    .header h1 {
      margin: 0;
      font-size: 1.5em;
    }
    .content {
      padding: 20px;
      color: #333;
    }
    .content p {
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background-color: #003B31;
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      text-align: center;
      width: 100%;
      max-width: 200px;
      box-sizing: border-box;
    }
    .footer {
      background: #003B31;
      padding: 10px;
      text-align: center;
      border-top: 1px solid #ddd;
      font-size: 0.9em;
      color: #ccc;
    }
    /* Media Queries */
        @media only screen and (max-width: 768px) {
            /* For tablets */
            .container {
                width: 90%;
                padding: 15px;
            }

            .header h1 {
                font-size: 22px;
            }

            .content {
                font-size: 15px;
            }

            .button {
                padding: 10px 15px;
                font-size: 14px;
            }
        }

        @media only screen and (max-width: 480px) {
            /* For phones */
            .container {
                width: 95%;
                padding: 10px;
            }

            .header h1 {
                font-size: 20px;
            }

            .content {
                font-size: 14px;
            }

            .button {
                padding: 10px;
                font-size: 13px;
            }

            .footer {
                font-size: 12px;
            }

  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to EDUTRACK App!</h1>
    </div>
    <div class="content">
      <p>Hello ${firstName},</p>
      <p>Thank you for joining our community! We're thrilled to have you on board.</p>
      <p>Please click the button below to verify your account:</p>
      <p>
        <a href="${verifyLink}" class="button">Verify My Account</a>
      </p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Best regards,<br>EDUTRACK TEAM</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} EDUTRACK Corp. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

    `
  };

  
  const verifyTemplate = (verifyLink, firstName) => {
      return `
      <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Welcome to EDUTRACK App</title>
      <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f7f7f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        background-color: #fff;
      }
      .header {
        background: #003B31;
        padding: 10px;
        text-align: center;
        border-bottom: 1px solid #ddd;
        color: #fff;
      }
      .content {
        padding: 20px;
        color: #333;
      }
      .footer {
        background: #003B31;
        padding: 10px;
        text-align: center;
        border-top: 1px solid #ddd;
        font-size: 0.9em;
        color: #ccc;
      }
        
      .button {
        display: inline-block;
        background-color: #003B31;
        color: #fff;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
      }
        /* Media Queries */
        @media only screen and (max-width: 768px) {
            /* For tablets */
            .container {
                width: 90%;
                padding: 15px;
            }

            .header h1 {
                font-size: 22px;
            }

            .content {
                font-size: 15px;
            }

            .button {
                padding: 10px 15px;
                font-size: 14px;
            }
        }

        @media only screen and (max-width: 480px) {
            /* For phones */
            .container {
                width: 95%;
                padding: 10px;
            }

            .header h1 {
                font-size: 20px;
            }

            .content {
                font-size: 14px;
            }

            .button {
                padding: 10px;
                font-size: 13px;
            }

            .footer {
                font-size: 12px;
            }

      </style>
      </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Account</h1>
        </div>
        <div class="content">
          <p>Hello ${firstName},</p>
          <p>We're excited to have you on board! Please click the button below to verify your account:</p>
          <p>
            <a href="${verifyLink}" class="button">Verify My Account</a>
          </p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>Best regards,<br>EDUTRACK TEAM</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EDUTRACK Corp. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
  const forgotPasswordTemplate = (resetLink, firstName) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: #fff;
          }
          .header {
            background: #003B31;
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            color: #fff;
          }
          .content {
            padding: 20px;
            color: #333;
          }
          .footer {
            background: #003B31;
            padding: 10px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #ccc;
          }
          .button {
            display: inline-block;
            background-color: #003B31;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
          }
            /* Media Queries */
        @media only screen and (max-width: 768px) {
            /* For tablets */
            .container {
                width: 90%;
                padding: 15px;
            }

            .header h1 {
                font-size: 22px;
            }

            .content {
                font-size: 15px;
            }

            .button {
                padding: 10px 15px;
                font-size: 14px;
            }
        }
        @media only screen and (max-width: 480px) {
            /* For phones */
            .container {
                width: 95%;
                padding: 10px;
            }

            .header h1 {
                font-size: 20px;
            }

            .content {
                font-size: 14px;
            }

            .button {
                padding: 10px;
                font-size: 13px;
            }

            .footer {
                font-size: 12px;
            }

        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
            <p>Click the button below to reset your password:</p>
            <p>
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>Best regards,<br>EDUTRACK TEAM</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EDUTRACK Corp. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // template.js
const generateAttendanceEmailTemplate = (subject, message, schoolName) => {
  return `
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
            @media only screen and (max-width: 1200px) {
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
                <p>&copy; 2024 ${schoolName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = { signUpTemplate, verifyTemplate, forgotPasswordTemplate, generateAttendanceEmailTemplate};
  