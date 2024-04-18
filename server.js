require("dotenv").config();
const jwt = require("jsonwebtoken");
const logger = require("./config/winston");

const app = require("./app");
const { Server } = require("socket.io");
const { io: otherIO } = require("socket.io-client");

const httpServer = require("http").createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: [
			"http://localhost:3000",
			"http://localhost:5173",
			"https://v2-stg-parkncharge.sysnetph.com",
		],
	},
});

let EVSE_UID = null;
let otherServerSocket = null;

io.use((socket, next) => {
	logger.info({
		SOCKET_AUTHENTICATION_MIDDLEWARE: {
			auth: socket.handshake.auth,
		},
	});

	EVSE_UID = "3b505713-2902-48de-80db-7b0fad55d978";

	otherServerSocket = otherIO(process.env.WEB_SOCKET_SERVER, {
		auth: {
			token: jwt.sign(
				{ ev_charger_id: EVSE_UID },
				process.env.WEB_SOCKET_SERVER_KEY
			),
		},
	});

	next();
});

io.on("connection", (socket) => {
	socket.on("new_connection", () => {
		console.log("New connection");
	});

	/** THIS EVENTS IS FOR TESTING PURPOSES ONLY */
	socket.on("charger-status", (data) => {
		logger.info({
			CHARGER_STATUS: {
				data,
			},
		});

		socket.broadcast.emit("charger-status", { status: "CHARGING" });
	});

	socket.on("charging-status", (data) => {
		logger.info({
			CHARGING_STATUS: {
				data,
			},
		});

		socket.broadcast.emit("charging-status", { status: "CHARGING" });
	});

	socket.on("charging-stop-details", (data) => {
		logger.info({
			CHARGING_STOP_DETAILS: {
				data,
			},
		});

		socket.broadcast.emit("charging-stop-details", { status: "CHARGING" });
	});
	/** =============================================== */

	otherServerSocket.on("connect", () => {
		logger.info({ CONNECTED_TO_SERVER_SIR_MARC: { message: "SUCCESS" } });
		socket.broadcast.emit("connected", () => {
			logger.info({ STATUS: "CONNECTED TO SERVER FROM SIR MARC" });
		});
	});

	otherServerSocket.on("charger-status", (data) => {
		logger.info({ CHARGER_STATUS: data });

		socket.broadcast.emit("charger-status", (data) => {
			logger.info({ CHARGER_STATUS: data });
		});
	});

	otherServerSocket.on("charging-status", (data) => {
		logger.info({ CHARGING_STATUS: data });

		socket.broadcast.emit("charging-status", (data) => {
			logger.info({ CHARGING_STATUS: data });
		});
	});

	otherServerSocket.on("charging-stop-details", (data) => {
		logger.info({ CHARGING_STOP_DETAILS: data });

		socket.broadcast.emit("charging-stop-details", (data) => {
			logger.info({ CHARGING_STOP_DETAILS: data });
		});
	});

	socket.on("disconnect", () => {
		logger.info({ SOCKET_DISCONNECTED: { message: "SUCCESS" } });
		otherServerSocket.disconnect(true);
	});
});

httpServer.listen(process.env.PORT, () => {
	console.log("Server is running on port: " + process.env.PORT);
});
