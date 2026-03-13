const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({///
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use SSL
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      // FORCE IPv4 ONLY - This fixes the ENETUNREACH error on Render
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000,
      dnsLookup: (hostname, options, callback) => {
        const dns = require('dns');
        // Force lookup to prioritize IPv4 (family 4)
        dns.lookup(hostname, { family: 4 }, callback);
      }
    });

    const mailOptions = {
      from: `"Legal Platform" <${process.env.GMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message, // Using HTML as seen in your auth.js
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error("❌ Email not sent:", error);
    // Don't throw the error, just log it so the registration doesn't 500
  }
};

module.exports = sendEmail;
