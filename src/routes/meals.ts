import { FastifyInstance } from 'fastify'
import { ZodError, z } from 'zod'
import { knex } from '../database'

export async function meals(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.post('/', async (request, reply) => {
    try {
      const mealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        dateTime: z.string(),
        isDiet: z.coerce.boolean(),
      })

      const { name, description, dateTime, isDiet } = mealsSchema.parse(
        request.body,
      )

      await knex('meals').insert({
        name,
        description,
        date: dateTime,
        is_diet: isDiet,
        user_id: request.user.sub,
      })

      return reply.status(201).send()
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(403).send(error.issues)
      }

      console.log(error)
    }
  })
}