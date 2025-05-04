const nodemailer = require('nodemailer');
const {EMAIL_SEND, PASSWORD_SEND} = process.env;

const sendLoginEmail = async (sendtoemail, content) => {
  console.log(EMAIL_SEND, PASSWORD_SEND);
  const transporter = nodemailer.createTransport({
    service: "hotmail", // Use your preferred service
    auth: {
      user: EMAIL_SEND,
      pass: PASSWORD_SEND,
    },
  });

  const mailOptions = {
    from: EMAIL_SEND,
    to: sendtoemail,
    subject: "Web Nodejs",
    text: content,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error.message);
      } else {
        resolve("sent email successfully");
      }
    });
  });
};

module.exports = sendLoginEmail;