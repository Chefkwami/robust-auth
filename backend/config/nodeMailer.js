import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_KEY,
    },
});

transporter
    .verify()
    .then(() => console.log("Mailer ready"))
    .catch((err) => console.error("Mailer verify failed", err));

export default transporter;