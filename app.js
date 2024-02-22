require("dotenv").config();
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();

// Loggers
const morgan = require("morgan");
const winston = require("./config/winston");

// Global Middlewares
app.use(helmet());
app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"https://v2-stg-parkncharge.sysnetph.com",
		],
		methods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
	})
);
app.use(express.urlencoded({ extended: false })); // To parse the urlencoded : x-www-form-urlencoded
app.use(express.json()); // To parse the json()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: winston.stream }));
app.use(cookieParser());

module.exports = app;
