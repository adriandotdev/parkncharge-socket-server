const UserRepository = require("../repository/UserRepository");
const { HttpNotFound } = require("../utils/HttpError");

module.exports = class UserService {
	#repository;

	constructor() {
		this.#repository = new UserRepository();
	}

	async GetUsers() {
		const users = await this.#repository.GetUsers();

		return users;
	}

	async FindUserById(userId) {
		const user = await this.#repository.FindUserById(userId);

		if (!user) {
			return new HttpNotFound("User Not Found", []);
		}
		return user;
	}
};
