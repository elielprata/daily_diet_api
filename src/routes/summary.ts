import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function summary(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/', async (request, reply) => {
    const meals = await knex('meals')

    let bestSequenceInDiet: number = 0

    meals.reduce((acc, meal) => {
      if (meal.is_diet === 1) {
        acc = acc + 1
        if (acc > bestSequenceInDiet) {
          bestSequenceInDiet = acc
        }
      } else {
        acc = 0
      }
      return acc
    }, 0)

    const summary = {
      totalMeals: meals.length,
      mealsInDiet: meals.filter((meal) => meal.is_diet === 1).length,
      mealsOutsideDiet: meals.filter((meal) => meal.is_diet === 0).length,
      bestSequenceInDiet,
    }

    return reply.status(200).send({ summary })
  })
}
