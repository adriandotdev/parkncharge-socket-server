// Service
const UserService = require("../services/UserService");

// Http Errors
const { HttpUnprocessableEntity } = require("../utils/HttpError");

// Configurations
const logger = require("../config/winston");

module.exports = (app) => {
	const service = new UserService();
	/**
	 * This function will be used by the express-validator for input validation,
	 * and to be attached to APIs middleware. */
	function validate(req, res) {
		const ERRORS = validationResult(req);

		if (!ERRORS.isEmpty()) {
			throw new HttpUnprocessableEntity(
				"Unprocessable Entity",
				ERRORS.mapped()
			);
		}
	}

	app.get("/api/v1/users", [], async (req, res) => {
		logger.info({ GET_USERS_API_REQUEST: { message: "Request" } });

		try {
			validate(req, res);

			const users = await service.GetUsers();

			logger.info({ GET_USERS_API_RESPONSE: { status: 200 } });

			return res.status(200).json({ status: 200, data: users });
		} catch (err) {
			if (err !== null) {
				logger.error({ GET_USERS_API_ERROR: { message: err.message } });

				return res
					.status(err.status)
					.json({ status: err.status, data: err.data, message: err.message });
			}

			logger.error({
				GET_USERS_API_ERROR: {
					message: "Internal Server Error",
				},
			});
			return res
				.status(500)
				.json({ status: 500, data: [], message: "Internal Server Error" });
		}
	});

	app.get("/api/v1/users/:id", [], async (req, res) => {
		const { id } = req.params;

		logger.info({ GET_USER_BY_ID_REQUEST: { user_id: id } });

		try {
			validate(req, res);

			const user = await service.FindUserById(id);

			logger.info({ GET_USER_BY_ID_RESPONSE: { status: 200 } });

			return res.status(200).json({ status: 200, data: user });
		} catch (err) {
			if (err !== null) {
				logger.error({ GET_USER_BY_ID_ERROR: { message: err.message } });

				return res
					.status(err.status)
					.json({ status: err.status, data: err.data, message: err.message });
			}

			logger.error({
				GET_USER_BY_ID_ERROR: {
					message: "Internal Server Error",
				},
			});
			return res
				.status(500)
				.json({ status: 500, data: [], message: "Internal Server Error" });
		}
	});
};
