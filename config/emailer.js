var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport

smtpConfig = {
    service: 'gmail', 
    auth: {
        user: 'veganrecipes02@gmail.com',
        pass: 'VeganRecipes123!'
    }
};

module.exports = nodemailer.createTransport(smtpConfig);
