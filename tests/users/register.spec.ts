import request from 'supertest'
import app from '../../src/app'

describe('POST /auth/register', () => {
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
            const response = await request(app)
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
            const response = await request(app)
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
            await request(app).post('/auth/register').send(userData)
            //Assert
        })
    })
    describe('Fields are missing.', () => {})
})
