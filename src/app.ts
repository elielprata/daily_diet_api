import fastify from 'fastify'
import jwt from '@fastify/jwt'

import { users } from './routes/users'
import { sessions } from './routes/sessions'
import { env } from './env'

export const app = fastify()

app.register(jwt, {
  secret: env.JWT_SECRET,
})

app.register(sessions)
app.register(users, { prefix: '/users' })
app.register(users, { prefix: '/meals' })
