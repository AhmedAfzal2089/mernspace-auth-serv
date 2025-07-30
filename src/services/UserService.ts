/* eslint-disable @typescript-eslint/no-unused-vars */
import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcryptjs";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const err = createHttpError(400, "Email already exists!");
            throw err;
        }

        //Hash the password,
        const saltRounds = 10; // using this just for a good practice
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                "failed to store the data in database",
            );
            throw error;
        }
    }
    async update(
        userId: number,
        { firstName, lastName, role, email, tenantId }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
                email,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                "failed to store the user  in database",
            );
            throw error;
        }
    }
    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            select: [
                "id",
                "firstName",
                "lastName",
                "email",
                "role",
                "password",
            ],
        });
    }
    async findById(id: number) {
        return await this.userRepository.findOne({
            where: { id },
            relations: {
                tenant: true,
            },
        });
    }
    async getAll(validatedQuery: UserQueryParams) {
        // find method fetches all the records in the database which is not good for pagination
        const queryBuilder = this.userRepository.createQueryBuilder("user"); // alias when working with SQL
        if (validatedQuery.q) {
            // the ILike is case insensitve while like is sensitive
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "(user.firstName || ' ' || user.lastName) ILike :q",
                        { q: searchTerm }, // binding
                    ).orWhere("user.email ILike :q", { q: searchTerm });
                }),
            );
            //grouping all these queries /^
        }
        if (validatedQuery.role) {
            queryBuilder.andWhere("user.role=:role", {
                role: validatedQuery.role,
            });
        }
        const result = await queryBuilder
            // to get a relation in a query builder , we use left join to get it
            .leftJoinAndSelect("user.tenant", "tenant")
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("user.id", "DESC")
            .getManyAndCount();

        // console.log(queryBuilder.getSql());
        return result;
    }
    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
