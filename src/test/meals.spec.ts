import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'child_process'
import { knex } from '../database'

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
  })

  it('should be able to create an meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'MealTest',
        description: 'Meal description',
        dateTime: 'asdfasdf',
        isDiet: false,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)
  })

  it('should be able to return 403 when fail validation data', async () => {
    await request(app.server)
      .post('/meals')
      .send({})
      .set({ Authorization: `Bearer ${userToken}` })
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
  it('should be able to view a single meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'MealTest',
        description: 'Meal description',
        dateTime: '2023-05-01T08:30:00',
        isDiet: false,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)

    const { body } = await request(app.server)
      .get('/meals')
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(200)

    const response = await request(app.server)
      .get(`/meals/${body.meals[0].id}`)
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(200)

    expect(response.body).toEqual({
      meal: body.meals[0],
    })
  })

  it('should be able to delete on meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'MealTest',
        description: 'Meal description',
        dateTime: '2023-05-01T08:30:00',
        isDiet: false,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)

    const { body } = await request(app.server)
      .get('/meals')
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(200)

    await request(app.server)
      .delete(`/meals/${body.meals[0].id}`)
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(204)

    expect(await knex('meals').where({ id: body.meals[0].id })).toEqual([])
  })

  it('should be to to edit a meal, being able to change all the data above', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'MealTest',
        description: 'Meal description',
        dateTime: '2023-05-01T08:30:00',
        isDiet: false,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(201)

    const { body } = await request(app.server)
      .get('/meals')
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(200)

    await request(app.server)
      .put(`/meals/${body.meals[0].id}`)
      .send({
        name: 'MealTest Update',
        description: 'Meal description Updated',
        dateTime: '2023-05-01T08:30:00',
        isDiet: true,
      })
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(204)

    const mealUpdated = await knex('meals').first()

    expect(mealUpdated).toContain({
      name: 'MealTest Update',
      description: 'Meal description Updated',
      date: '2023-05-01T08:30:00',
      is_diet: 1,
    })
  })
})
