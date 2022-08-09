import { cleanEnv, str, num } from 'envalid'

export const env = cleanEnv(process.env, {
  PORT: num({ default: 4000 }),
  HOST: str({ default: 'localhost' }),
  NODE_ENV: str({
    default: 'dev',
    choices: ['dev', 'test', 'prod']
  }),
  JWT_KEY: str({ default: 'secret' }),
  BD_PORT: num({ default: 5656 })
})
