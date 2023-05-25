import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'child_process'

describe('Users Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to create an meal', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Testmeals',
        email: 'testmeals@test.com',
        password: 'test',
      })
      .expect(201)

    const {
      body: { token },
    } = await request(app.server)
      .post('/login')
      .send({
        email: 'testmeals@test.com',
        password: 'test',
      })
      .expect(200)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'MealTest',
        description: 'Meal description',
        dateTime: 'asdfasdf',
        isDiet: false,
      })
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
  })

  it('should be able to return 403 when fail validation data', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Testmeals',
        email: 'testmeals@test.com',
        password: 'test',
      })
      .expect(201)

    const {
      body: { token },
    } = await request(app.server)
      .post('/login')
      .send({
        email: 'testmeals@test.com',
        password: 'test',
      })
      .expect(200)

    await request(app.server)
      .post('/meals')
      .send({})
      .set({ Authorization: `Bearer ${token}` })
      .expect(403)
  })

  it('should be able to return 401 when not have a token', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Test',
        description: 'it is a description test',
        date: '2023-05-01T08:30:00',
        isDiet: false,
      })
      .set({ Authorization: 'Bearer test' })
      .expect(401)
  })
})
