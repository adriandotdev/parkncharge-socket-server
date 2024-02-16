require("dotenv").config();
const jwt = require("jsonwebtoken");
const logger = require("./config/winston");

const app = require("./app");
const { Server } = require("socket.io");
const { io: otherIO } = require("socket.io-client");

const httpServer = require("http").createServer(app);

const io = new Server(httpServer);

const otherServerSocket = otherIO(process.env.WEB_SOCKET_SERVER, {
	auth: {
		token: jwt.sign({ ev_charger_id: 2 }, process.env.WEB_SOCKET_SERVER_KEY),
	},
});

io.on("connection", (socket) => {
	otherServerSocket.on("connect", () => {
		socket.emit("connect", () => {
			logger.info({ STATUS: "CONNECTED TO SERVER FROM SIR MARC" });
		});
	});

	otherServerSocket.on("charger-status", (data) => {
		logger.info({ CHARGER_STATUS: data });

		socket.emit("charger-status", (data) => {
			logger.info({ CHARGER_STATUS: data });
		});
	});

	otherServerSocket.on("charging-status", (data) => {
		logger.info({ CHARGING_STATUS: data });

		socket.emit("charging-status", (data) => {
			logger.info({ CHARGING_STATUS: data });
		});
	});

	otherServerSocket.on("charging-stop-details", (data) => {
		logger.info({ CHARGING_STOP_DETAILS: data });

		socket.emit("charging-stop-details", (data) => {
			logger.info({ CHARGING_STOP_DETAILS: data });
		});
	});
});

httpServer.listen(process.env.PORT, () => {
	console.log("Server is running on port: " + process.env.PORT);
});
