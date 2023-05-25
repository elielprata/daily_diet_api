import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
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

  it('should be able sign-in and return token', async () => {
    await request(app.server)
      .post('/users')
      .send({ name: 'Test', email: 'test@test.com', password: 'test' })
      .expect(201)

    const response = await request(app.server)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'test',
      })
      .expect(200)

    expect(response.body).toEqual({ token: expect.any(String) })
  })

  it('should be able return 400 when email or password is not right', async () => {
    await request(app.server)
      .post('/users')
      .send({ name: 'Test', email: 'test@test.com', password: 'test' })
      .expect(201)

    const response = await request(app.server)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: '',
      })
      .expect(400)

    expect(response.body).toContain({
      error: 'email or password incorrect',
    })
  })
})
