import Hapi from '@hapi/hapi'

import { apolloServer } from './apollo/server'
import { env } from './env'
import * as allServices from './services'

export type Services = typeof allServices
type BoostrapFn = (services: Services) => Promise<Hapi.Server>

export const startServer: BoostrapFn = async (services) => {
  const app = Hapi.server({ port: env.PORT, host: env.HOST, routes: { cors: true } })
  const server = apolloServer({ hapiServer: app, services })
  await server.start()
  await server.applyMiddleware({ app })
  return app
}

startServer(allServices).then(async (app) => {
  await app.start()
  console.log('Server ready at http://localhost:4000/graphql')
}).catch(console.error)
