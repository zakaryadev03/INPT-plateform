const nodeMailer = require('nodemailer');

exports.sendEmail = async (options) => {
    const transporer = nodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "98f7a02513ba84",
          pass: "1271bf6e643f05"
        }
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporer.sendMail(mailOptions);
}