import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import request from "supertest";
import { App } from "supertest/types";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST  /users", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(() => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });
    describe("Given all fields ", () => {
        it("should persist the user in database", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
                tenantId: 1,
            };
            // Add token to cookie
            await request(app as unknown as App)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });
        it("should create a manager user", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
                tenantId: 1,
            };
            // Add token to cookie
            await request(app as unknown as App)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });
        it.todo("should return 403 if non admin user tries to create a user");
    });
});
