const request = require("supertest");
const app = require("../app");
const mysql = require("../database/mysql");

const PORT = 4001;

const server = app.listen(PORT, () => {
	console.log(`PORT LISTENING IN ${PORT}`);
});

describe("Basic Token API", () => {
	beforeAll(async () => {
		mysql.on("connection", () => {
			console.log("SQL Connected");
		});
	}, 5000);

	afterAll((done) => {
		server.close(done);
		mysql.end();
	}, 5000);

	describe("User Unit Tests", () => {
		const response = request(app).get("/api/v1/users");

		expect(response.status).toBe(200);
	});
});
