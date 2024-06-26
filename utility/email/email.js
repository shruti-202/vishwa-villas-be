const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const nodemailer = require("nodemailer");

// Create a SMTP transporter object
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SERVER_MAIL_ID,
    pass: process.env.SERVER_MAIL_PASSWORD,
  },
});

const sendMail = (to, subject, body) => {
  //Message object
  let message = {
    from: process.env.SERVER_MAIL_ID,
    to: to,
    subject: subject,
    html: body,
  };

  transporter.sendMail(message, (err, info) => {
    console.log(process.env.SERVER_MAIL_ID, process.env.SERVER_MAIL_PASSWORD);
    if (err) {
      console.log("Error occurred. " + err.message);
      return process.exit(1);
    }

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
};

module.exports = sendMail;
