import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import { App } from "supertest/types";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/constants";

describe("POST /tenants", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });
    afterEach(() => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });
    describe("Given all fields ", () => {
        it("should return a 201 status code", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Adress",
            };
            const response = await request(app as unknown as App)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);
            expect(response.status).toBe(201);
        });
        it("should create a tenant in the database", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Adress",
            };
            await request(app as unknown as App)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
        it("should should return 401 if user is not authenticated", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Adress",
            };
            const response = await request(app as unknown as App)
                .post("/tenants")
                .send(tenantData);
            expect(response.statusCode).toBe(401);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
        });
        it("should should return 403 if role is not an admin", async () => {
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Adress",
            };
            const response = await request(app as unknown as App)
                .post("/tenants")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(tenantData);
            expect(response.statusCode).toBe(403);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
        });
        it("should should return 403 if role is not an admin", async () => {
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Adress",
            };
            const response = await request(app as unknown as App)
                .post("/tenants")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(tenantData);
            expect(response.statusCode).toBe(403);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
        });
    });
    describe("Not given all the fields", () => {
        it("should return 400 if name is not provided", async () => {
            const tenantData = {
                name: "",
                address: "Tenant Adress",
            };
            const response = await request(app as unknown as App)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(response.statusCode).toBe(400);
            expect(tenants).toHaveLength(0);
        });
        it("should return 400 if address is not provided", async () => {
            const tenantData = {
                name: "Tenant Name",
                address: "",
            };
            const response = await request(app as unknown as App)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(response.statusCode).toBe(400);
            expect(tenants).toHaveLength(0);
        });
    });
});
