import fastify from 'fastify'
import { users } from './routes/users'
import { sessions } from './routes/sessions'

export const app = fastify()

app.register(sessions)
app.register(users, { prefix: '/users' })
