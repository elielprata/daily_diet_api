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

  it('should be able to create an user', async () => {
    await request(app.server)
      .post('/users')
      .send({ name: 'Test', email: 'test@test.com', password: 'test' })
      .expect(201)
  })

  it('should be able to return error when data is invalid ', async () => {
    const response = await request(app.server).post('/users').send({})

    expect(response.body).toContainEqual({
      code: 'invalid_type',
      expected: 'string',
      message: 'Required',
      path: ['name'],
      received: 'undefined',
    })
    expect(response.status).toBe(403)
  })
})
