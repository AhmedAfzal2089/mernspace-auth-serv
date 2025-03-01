import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { App } from 'supertest/types'
import { Roles } from '../../src/constants'

describe('POST /auth/register', () => {
    let connection: DataSource
    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })
    beforeEach(async () => {
        // Database truncate (cleaning db before each test)
        await connection.dropDatabase()
        await connection.synchronize()
    })
    afterAll(async () => {
        await connection.destroy()
    })
    describe('Given all fields', () => {
        it('should return 201 status code', async () => {
            //Arrange
            const userData = {
                firstName: 'Ahmed',
                lastName: 'Afzal',
                email: 'ahmed@mern.space',
                password: 'secret',
            }
            //Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData)
            //Assert
            expect(response.statusCode).toBe(201)
        })
        it('should return valid json response', async () => {
            //Arrange
            const userData = {
                firstName: 'Ahmed',
                lastName: 'Afzal',
                email: 'ahmed@mern.space',
                password: 'secret',
            }
            //Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData)
            //Assert application/json
            expect(
                (response.header as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'))
        })
        it('should persisit the user in the database', async () => {
            //Arrange
            const userData = {
                firstName: 'Ahmed',
                lastName: 'Afzal',
                email: 'ahmed@mern.space',
                password: 'secret',
            }
            //Act
            await request(app as unknown as App)
                .post('/auth/register')
                .send(userData)
            //Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(1)
            expect(users[0].firstName).toBe(userData.firstName)
            expect(users[0].lastName).toBe(userData.lastName)
            expect(users[0].email).toBe(userData.email)
        })
        it('should return the id of created user ', async () => {
            //Arrange
            const userData = {
                firstName: 'Ahmed',
                lastName: 'Afzal',
                email: 'ahmed@mern.space',
                password: 'secret',
            }
            //Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData)
            //Assert
            expect(response.body).toHaveProperty('id')
            const repository = connection.getRepository(User)
            const users = await repository.find()
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            )
        })
        it('should assign a customer role', async () => {
            //Arrange
            const userData = {
                firstName: 'Ahmed',
                lastName: 'Afzal',
                email: 'ahmed@mern.space',
                password: 'secret',
            }
            //Act
            await request(app as unknown as App)
                .post('/auth/register')
                .send(userData)
            //Assert
            const repository = connection.getRepository(User)
            const users = await repository.find()
            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })
    })
    describe('Fields are missing.', () => {})
})
