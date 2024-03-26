const config = require("./config/config");
const app = require("./app");

const httpServer = require("http").createServer(app);

const { Server } = require("socket.io");
const io = new Server(httpServer);

const logger = require("./config/winston");

io.on("connection", (socket) => {
	logger.info({ SOCKET_NEW_CONNECTION: { socket_id: socket.id } });

	socket.on("new_connection", (payload) => {
		logger.info({
			EVENT_EMITTED: {
				event: "connect",
				payload,
			},
		});

		socket.join(payload);
	});

	/** This socket will notify ALL users when there is someone reserves a time slot. */
	socket.on("reserve", (payload) => {
		/**
		 * The client must be able to re-render his/her page with new status.
		 *
		 * By requesting to the API again.
		 */
		socket.emit("new_reservation_occur", payload);
	});

	socket.on("cancel_reservation", (payload) => {
		socket.emit("cancel_reservation_occur", payload);
	});

	socket.on("charging", (payload) => {
		socket.on("charging_occur", payload);
	});

	socket.on("listen", (payload) => {
		logger.info({
			EVENT_EMITTED: {
				event: "listen",
				payload,
			},
		});

		socket.broadcast.emit("listen", payload.dataToRender);
	});

	socket.on("disconnect", () => {
		console.log("Disconnected user: " + socket.id);
	});
});

httpServer.listen(config.server.port, () => {
	console.log("server is running on port: " + config.server.port);
});
