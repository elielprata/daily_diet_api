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

  it('should be able to create an meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Test',
        description: 'it is a description test',
        date: '2023-05-01T08:30:00',
      })
      .expect(201)
  })
})
