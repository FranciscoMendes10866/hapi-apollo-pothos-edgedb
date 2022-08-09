import Hapi from '@hapi/hapi'
import * as edgedb from 'edgedb'

import { apolloServer } from './apollo/server'
import { env } from './env'

type BoostrapFn = () => Promise<Hapi.Server>

export const startServer: BoostrapFn = async () => {
  const app = Hapi.server({ port: env.PORT, host: env.HOST, routes: { cors: true } })
  const client = edgedb.createClient({ port: env.BD_PORT, tlsSecurity: 'insecure' })

  const server = apolloServer({ hapiServer: app, edgedb: client })
  await server.start()
  await server.applyMiddleware({ app })

  return app
}

startServer().then(async (app) => {
  await app.start()
  console.log('Server ready at http://localhost:4000/graphql')
}).catch(console.error)
