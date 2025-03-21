import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import request from "supertest";
import { App } from "supertest/types";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("GET auth/self", () => {
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
        it("should return the 200 status code ", async () => {
            //Generate Token
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const response = await request(app as unknown as App)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            expect(response.statusCode).toBe(200);
        });
        it("should return the user data ", async () => {
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Register user
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            //Generate Token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // Add token to cookie
            const response = await request(app as unknown as App)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            //Assert
            // Check if user id matches with registered user
            expect((response.body as Record<string, string>).id).toBe(data.id);
        });
        it("should not return the password field", async () => {
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Register user
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            //Generate Token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            // Add token to cookie
            const response = await request(app as unknown as App)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            //Assert
            // Check if user id matches with registered user
            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
        });
        it("should should return 401 status code if token does not exists", async () => {
            const userData = {
                firstName: "Ahmed",
                lastName: "Afzal",
                email: "ahmedafzal2089@gmail.com",
                password: "Password123!",
            };
            //Register user
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            // Add token to cookie
            const response = await request(app as unknown as App)
                .get("/auth/self")
                .send();
            //Assert
            // Check if user id matches with registered user
            expect(response.statusCode).toBe(401);
        });
    });
});
