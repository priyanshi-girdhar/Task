const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
    }
});

const mallOptions = {
    from: 'your_email@gmail.com',
    to: 'recipient_email@gmail.com',
    subject: 'Test Email',
    text: 'Hello, this is a test email sent using Nodematler!'
};

transporter.sendMail(mailoptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
console.log('Email sent:'+ info.response);
});