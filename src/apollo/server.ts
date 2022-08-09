import {
  ApolloServer,
  ApolloServerPluginStopHapiServer
} from 'apollo-server-hapi'
import {
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core'
import { initContextCache } from '@pothos/core'
import { Client as DatabaseClient } from 'edgedb'
import { Server, Request } from '@hapi/hapi'

import { schema } from './schema'
import { Context } from './builder'
import { verifyAccessToken } from '../utils'

interface ApolloServerProps {
  hapiServer: Server
  edgedb: DatabaseClient
}

interface ApolloServerContextArgs {
  request: Request
}

type APolloServerFn = (args: ApolloServerProps) => ApolloServer

export const apolloServer: APolloServerFn = ({ hapiServer, edgedb }) => {
  return new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    introspection: true,
    plugins: [
      ApolloServerPluginStopHapiServer({ hapiServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true })
    ],
    context: async ({ request }: ApolloServerContextArgs): Promise<Context> => {
      const defaultCtx = {
        ...initContextCache(),
        edgedb,
        req: request,
        currentSession: { sessionId: null }
      }

      const { authorization } = request.headers
      if (authorization === undefined) return defaultCtx

      const isValid = authorization.startsWith('Bearer ')
      if (!isValid) return defaultCtx

      const token = authorization.replace('Bearer', '').trim()
      const decoded = await verifyAccessToken(token)
      return {
        ...defaultCtx,
        currentSession: { sessionId: decoded.sessionId }
      }
    }
  })
}
