require("dotenv").config();
const nodemailer = require("nodemailer");
const winston = require("../config/winston");

const transporter = nodemailer.createTransport({
	name: process.env.NODEMAILER_NAME,
	host: process.env.NODEMAILER_HOST,
	port: process.env.NODEMAILER_PORT,
	secure: process.env.NODEMAILER_SECURE,
	auth: {
		user: process.env.NODEMAILER_USER,
		pass: process.env.NODEMAILER_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

module.exports = class Email {
	constructor(email_address, data) {
		this._email_address = email_address;
		this._data = data;
	}

	async SendOTP() {
		winston.info("Send Email To CPO Function");

		winston.info("EMAIL RECIPIENT: " + this._email_address);

		try {
			let htmlFormat = `
			  <h1>ParkNcharge</h1>
	
			  <h2>PLEASE DO NOT SHARE THIS OTP TO ANYONE</h2>
			  ${this._data.otp}
			  
			  <p>Kind regards,</p>
			  <p><b>ParkNcharge</b></p>
			`;

			let textFormat = `ParkNcharge\n\nPLEASE DO NOT SHARE THIS OTP TO ANYONE\n\nKind regards,\nParkNCharge`;
			// send mail with defined transport object
			const info = await transporter.sendMail({
				from: process.env.NODEMAILER_USER, // sender address
				to: this._email_address, // list of receivers
				subject: "ParkNcharge Credentials (no-reply)", // Subject line
				text: textFormat, // plain text body
				html: htmlFormat, // html body
			});

			winston.info("Message sent: APPROVED %s", info.messageId);
		} catch (err) {
			console.log(err);
			throw new Error({ connection: data.connection });
		}
	}
};
