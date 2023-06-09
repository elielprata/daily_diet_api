import { FastifyInstance } from 'fastify'
import { z, ZodError } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcrypt'

export async function users(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    try {
      const createUserSchema = z.object({
        name: z.string(),
        email: z.string().email('invalid email'),
        password: z.string(),
      })

      const { name, email, password } = createUserSchema.parse(request.body)

      const passwordHash = await bcrypt.hash(password, 6)

      await knex('users').insert({
        id: randomUUID(),
        name,
        email,
        password: passwordHash,
      })

      return reply.status(201).send()
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(403).send(error.issues)
      }
    }
  })
}
