import { config } from 'dotenv'
import { resolve } from 'node:path'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: resolve('.env.test') })
} else {
  config()
}

const envSchema = z.object({
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
