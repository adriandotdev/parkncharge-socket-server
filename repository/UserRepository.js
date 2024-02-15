const mysql = require("../database/mysql");

module.exports = class UserRepository {
	GetUsers() {
		return new Promise((resolve, reject) => {
			resolve([
				{
					user_id: 1,
					name: "Nads",
				},
				{ user_id: 2, name: "Marc" },
			]);
		});
	}

	FindUserById(userId) {
		return new Promise((resolve, reject) => {
			resolve({ user_id: 1, name: "Nads" });
		});
	}
};
