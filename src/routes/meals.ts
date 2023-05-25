import { FastifyInstance } from 'fastify'
import { ZodError, z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function meals(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/', async (request, reply) => {
    const meals = await knex('meals')
      .select('*')
      .where({ user_id: request.user.sub })

    return reply.status(200).send({ meals })
  })

  app.get('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({ id, user_id: request.user.sub })
      .first()

    return reply.status(200).send({ meal })
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
        id: randomUUID(),
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

  app.put('/:id', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({
          id,
          user_id: request.user.sub,
        })
        .first()

      if (!meal) {
        return reply.status(404).send()
      }

      const mealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        dateTime: z.string(),
        isDiet: z.coerce.boolean(),
      })

      const { name, description, dateTime, isDiet } = mealsSchema.parse(
        request.body,
      )

      await knex('meals').where({ id }).update({
        name,
        description,
        date: dateTime,
        is_diet: isDiet,
      })

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(403).send(error.issues)
      }

      console.log(error)
    }
  })

  app.delete('/:id', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = paramsSchema.parse(request.params)

      await knex('meals').where({ id, user_id: request.user.sub }).del()

      return reply.status(204).send()
    } catch (error) {
      console.log(error)
    }
  })
}
