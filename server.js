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

const otherServerSocket = otherIO(process.env.WEB_SOCKET_SERVER, {
	auth: {
		token: jwt.sign({ ev_charger_id: 2 }, process.env.WEB_SOCKET_SERVER_KEY),
	},
});

io.use((socket, next) => {
	console.log(socket.id);

	console.log("Authentication Middleware");
	next();
});

io.on("connection", (socket) => {
	socket.on("new_connection", () => {
		console.log("New connection");
	});

	/** THIS EVENTS IS FOR TESTING PURPOSES ONLY */
	socket.on("charger-status", (data) => {
		console.log("RECEIVED FROM NADS CHARGER STATUS: " + data);

		socket.broadcast.emit("charger-status", { status: "CHARGING" });
	});

	socket.on("charging-status", (data) => {
		console.log("RECEIVED FROM NADS CHARGER STATUS: " + data);

		socket.broadcast.emit("charging-status", { status: "CHARGING" });
	});

	socket.on("charging-stop-details", (data) => {
		console.log("RECEIVED FROM NADS CHARGER STATUS: " + data);

		socket.broadcast.emit("charging-stop-details", { status: "CHARGING" });
	});
	/** =============================================== */

	otherServerSocket.on("connect", () => {
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
		console.log(`${socket.id} disconnected`);
	});
});

httpServer.listen(process.env.PORT, () => {
	console.log("Server is running on port: " + process.env.PORT);
});
