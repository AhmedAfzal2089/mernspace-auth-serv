/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas; // this will provide all the list of entities
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};
// parameter & its type , return type
export const isJwt = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }
    const parts = token.split("."); // it will return an array
    if (parts.length !== 3) {
        return false;
    }
    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8"); // converting base 64 string into utf 8
        });
        return true;
    } catch (err) {
        return false;
    }
};
