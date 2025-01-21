import nodemailer from 'nodemailer';

let  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      type: 'OAuth2',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
  });


export default transporter;