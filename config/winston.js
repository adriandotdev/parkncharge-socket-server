const { createLogger, format, transports, addColors } = require("winston");
const path = require("path");
const { splat, combine, timestamp, printf, json } = format;
const myFormat = printf(({ timestamp, level, message, meta }) => {
	if (meta && meta instanceof Error) {
		return `[${timestamp}] [${level}] : ${message} ${meta.stack}`;
	}
	if (typeof message === "object" && message !== null) {
		return `[${timestamp}] [${level}] : ${JSON.stringify(message, null, 2)}`;
	}
	return `[${timestamp}] [${level}] : ${message}`;
});

require("winston-daily-rotate-file");

const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

addColors(colors);

const options = {
	info: {
		level: "info",
		filename: "admin_evses-%DATE%.log",
		dirname:
			path.dirname(__dirname) +
			path.sep +
			"logs" +
			path.sep +
			"admin_evses" +
			path.sep,
		handleExceptions: true,
		json: true,
		colorize: true,
		zippedArchive: true,
		maxSize: "30m",
		maxFiles: "90d",
	},
	error: {
		level: "error",
		filename: "nspocpi-%DATE%.log",
		dirname:
			path.dirname(__dirname) +
			path.sep +
			"logs" +
			path.sep +
			"admin_evses" +
			path.sep,
		handleExceptions: true,
		json: true,
		colorize: true,
		zippedArchive: true,
		maxSize: "30m",
		maxFiles: "90d",
	},
	console: {
		level: "debug",
		handleExceptions: true,
		json: true,
		colorize: true,
	},
};

const logger = createLogger({
	transports: [
		new transports.DailyRotateFile(options.info),
		new transports.DailyRotateFile(options.error),
		new transports.Console(options.console),
	],
	format: combine(
		timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		splat(),
		json({ stable: true }),
		format.colorize({ all: false }),
		myFormat
	),
	exitOnError: false,
});

logger.silent = process.env.NODE_ENV === "test" ? true : false; // CHANGE THIS to 'true' when testing

logger.stream = {
	write: function (message, encoding) {
		if (!message.includes("ELB-HealthChecker")) {
			logger.info(message);
		}
	},
};

module.exports = logger;
