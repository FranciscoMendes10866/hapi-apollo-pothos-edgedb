import { cleanEnv, str, num } from 'envalid'

export const env = cleanEnv(process.env, {
  PORT: num({ default: 4000 }),
  NODE_ENV: str({
    default: 'dev',
    choices: ['dev', 'test', 'prod']
  }),
  JWT_KEY: str({ default: 'secret' })
})
