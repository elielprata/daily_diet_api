import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import bcrypt from 'bcrypt'

export async function sessions(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = loginSchema.parse(request.body)

    const user = await knex.first('*').from('users').where('email', email)

    if (!user) {
      return reply.status(400).send({ error: 'email or password incorrect' })
    }

    const verifyPassword = await bcrypt.compare(password, user.password)

    if (!verifyPassword) {
      return reply.status(400).send({ error: 'email or password incorrect' })
    }

    const token = app.jwt.sign(
      {
        name: user.name,
      },
      {
        sub: user.id,
        expiresIn: '1 day',
      },
    )

    return reply.status(200).send({ token })
  })
}
