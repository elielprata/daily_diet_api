import { afterAll, beforeAll, describe, expect, it } from 'vitest'
// import request from 'supertest'
import { app } from '../app'
import { beforeEach } from 'node:test'
import { execSync } from 'node:child_process'

describe('User Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create an user', async () => {
    expect(2 + 2).toBe(4)
  })
})
