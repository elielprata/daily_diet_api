import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'child_process'

let userToken: string

describe('Users Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')

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

    userToken = token

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Meal 1',
        description: 'Meal description',
        dateTime: '2023-05-01T08:10:00',
        isDiet: false,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Meal 2',
        description: 'Meal description',
        dateTime: '2023-05-01T12:00:00',
        isDiet: true,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Meal 3',
        description: 'Meal description',
        dateTime: '2023-05-01T18:10:00',
        isDiet: true,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Meal 4',
        description: 'Meal description',
        dateTime: '2023-05-02T18:10:00',
        isDiet: true,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Meal 5',
        description: 'Meal description',
        dateTime: '2023-05-02T18:10:00',
        isDiet: false,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)
  })

  it('should be able to to retrieve a user metrics', async () => {
    const { body } = await request(app.server)
      .get('/summary')
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(200)

    expect(body.summary.totalMeals).toEqual(5)
    expect(body.summary.mealsInDiet).toEqual(3)
    expect(body.summary.mealsOutsideDiet).toEqual(2)
    expect(body.summary.bestSequenceInDiet).toEqual(3)
  })
})
