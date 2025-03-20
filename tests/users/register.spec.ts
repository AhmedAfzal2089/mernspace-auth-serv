import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { App } from "supertest/types";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST /auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        // Database truncate (cleaning db before each test)
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterAll(async () => {
        await connection.destroy();
    });
    describe("Given all fields", () => {
        it("should return 201 status code", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            expect(response.statusCode).toBe(201);
        });
        it("should return valid json response", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert application/json
            expect(
                (response.header as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });
        it("should persisit the user in the database", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
        it("should return the id of created user ", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            expect(response.body).toHaveProperty("id");
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });
        it("should assign a customer role", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });
        it("should store the hashed password in the database", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            const repository = connection.getRepository(User);
            const users = await repository.find({ select: ["password"] });
            // console.log(users[0].password);
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/); // checking the hash starting with this format
        });
        it("should return 400 status code if email already exists", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            const users = await userRepository.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
        it("should return the access token and refresh token inside the cookie", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);

            //Assert
            let accessToken = null;
            let refreshToken = null;
            interface Headers {
                ["set-cookie"]: string[];
            }
            // accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict
            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
        it("should store the refresh token in the database ", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            // const refreshTokens = await refreshTokenRepo.find();
            // expect(refreshTokens).toHaveLength(1);
            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });
    describe("Fields are missing.", () => {
        it("should return 400 status code if email field is missing", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if first name field is missing", async () => {
            //Arrange
            const userData = {
                firstName: "",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if last name field is missing", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password field is missing", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
    describe("Fields are not in proper format ", () => {
        it("should trim the email field", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: " ahmedafzal2089@gmail.com ",
                password: "Password123!",
            };
            //Act
            await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe("ahmedafzal2089@gmail.com");
        });
        it("should return 400 status code if email is not valid email", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "notemail",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password length is less than 8 characters", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "notemail",
                password: "pass",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should return an array of error messages if email is missing", async () => {
            //Arrange
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "",
                password: "Password123!",
            };
            //Act
            const response = await request(app as unknown as App)
                .post("/auth/register")
                .send(userData);
            //Assert
            expect(response.body).toHaveProperty("errors");
            expect(
                (response.body as Record<string, string>).errors.length,
            ).toBeGreaterThan(0);
        });
    });
});
