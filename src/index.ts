import http from 'http'

import Koa from 'koa'
import * as edgedb from 'edgedb'

import { apolloServer } from './apollo/server'
import { env } from './env'

type BoostrapFn = () => void

const bootstrap: BoostrapFn = async () => {
  const httpServer = http.createServer()
  const app = new Koa()
  const client = edgedb.createClient({ port: 5656, tlsSecurity: 'insecure' })

  const server = apolloServer({ httpServer, edgedb: client })
  await server.start()
  server.applyMiddleware({ app })

  httpServer.on('request', app.callback())

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: env.PORT }, resolve)
  )

  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
}

void bootstrap()
