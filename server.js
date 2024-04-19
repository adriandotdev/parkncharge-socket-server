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

let otherServerSocket = null;

io.use((socket, next) => {
	logger.info({
		SOCKET_AUTHENTICATION_MIDDLEWARE: {
			auth: socket.handshake.auth,
		},
	});

	next();
});

io.on("connection", (socket) => {
	logger.info({
		NADS_SERVER_CONNECTION_ESTABLISHED: {
			message: "SUCCESS",
		},
	});

	const EV_CHARGER_ID = socket.handshake.query.ev_charger_id;

	socket.join(socket.handshake.query.ev_charger_id);

	otherServerSocket = otherIO(process.env.WEB_SOCKET_SERVER, {
		auth: {
			token: jwt.sign(
				{ ev_charger_id: EV_CHARGER_ID },
				process.env.WEB_SOCKET_SERVER_KEY
			),
		},
	});

	/** ==================================================================== EVENTS OF SIR MARC ====================================================================== */
	otherServerSocket.on("connect", () => {
		logger.info({
			SERVER_SIR_MARC_CONNECTION_ESTABLISHED: {
				message: "SUCCESS",
			},
		});
	});

	otherServerSocket.on("charger-status", (data) => {
		logger.info({ CHARGER_STATUS: { ...data } });

		if (data.status === "UNPLUGGED-ONLINE") {
			socket.to(data.ev_charger_id).emit("unplugged-charger", data);
		}
	});

	otherServerSocket.on("charging-status", (data) => {
		logger.info({ CHARGING_STATUS: { ...data } });

		socket.to(data.ev_charger_id).emit("charging-status", data);
	});

	otherServerSocket.on("charging-stop-details", (data) => {
		logger.info({ CHARGING_STOP_DETAILS: { ...data } });

		socket.to(data.ev_charger_id).emit("charging-overstay", data);
	});

	otherServerSocket.on("disconnect", () => {
		logger.info({
			DISCONNECTED_FROM_SIR_MARC_SERVER: {
				message: "SUCCESS",
			},
		});
	});
	/** ==================================================================== END OF SIR MARC SERVER EVENTS ====================================================================== */

	/** MY OWN EVENTS */
	socket.on("charger-status", (data) => {
		logger.info({
			NADS_CHARGER_STATUS: {
				...data,
			},
		});

		socket.emit("charger-status", data);
	});

	socket.on("charging-status", (data) => {
		logger.info({
			NADS_CHARGING_STATUS: {
				data,
			},
		});

		socket.emit("charging-status", data);
	});

	socket.on("charging-stop-details", (data) => {
		logger.info({
			NADS_CHARGING_STOP_DETAILS: {
				data,
			},
		});

		socket.emit("charging-stop-details", data);
	});

	socket.on("charging-overstay", (data) => {
		logger.info({
			NADS_CHARGING_OVERSTAY: {
				data,
			},
		});

		socket.emit("charging-overstay", data);
	});

	socket.on("unplugged-charger", (data) => {
		logger.info({
			NADS_UNPLUGGED_CHARGER: {
				data,
			},
		});

		socket.emit("unplugged-charger", data);
	});

	socket.on("disconnect", () => {
		logger.info({
			DISCONNECTED_FROM_NADS_SOCKET_SERVER: { message: "SUCCESS" },
		});

		otherServerSocket.disconnect(true);
	});
});

httpServer.listen(process.env.PORT, () => {
	console.log("Server is running on port: " + process.env.PORT);
});
