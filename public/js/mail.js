// Part 3
const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: 'ec76c06b97071cd474160e62c969efda-07e45e2a-8f245570',
        domain: 'sandbox9aa23b091bfe40f0ac91e6a4ea5cfb26.mailgun.org'
    }
};

const transporter = nodemailer.createTransport(mailGun(auth));

// Part 4

const sendMail = (email, subject, text, callback) => {
    const mailOptions = {
        from: email,
        to: 'Lazopee2020@gmail.com',
        subject: subject,
        text: text
    };
    
    transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
}

module.exports = sendMail;

