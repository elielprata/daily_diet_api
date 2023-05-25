import fastify from 'fastify'
import jwt from '@fastify/jwt'

import { env } from './env'

import { users } from './routes/users'
import { sessions } from './routes/sessions'
import { meals } from './routes/meals'

export const app = fastify()

app.register(jwt, {
  secret: env.JWT_SECRET,
})

app.register(sessions)
app.register(users, { prefix: '/users' })
app.register(meals, { prefix: '/meals' })
