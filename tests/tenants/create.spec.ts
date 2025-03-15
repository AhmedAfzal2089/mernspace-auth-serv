import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import { App } from "supertest/types";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /tenants", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(() => {});
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
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
    });
});
