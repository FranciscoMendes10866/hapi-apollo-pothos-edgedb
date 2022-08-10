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
import { Services } from '../index'
import * as utils from '../utils'

export type Utils = typeof utils

interface ApolloServerProps {
  hapiServer: Server
  edgedb: DatabaseClient
  services: Services
}

interface ApolloServerContextArgs {
  request: Request
}

type APolloServerFn = (args: ApolloServerProps) => ApolloServer

export const apolloServer: APolloServerFn = ({ hapiServer, edgedb, services }) => {
  return new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginStopHapiServer({ hapiServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true })
    ],
    context: async ({ request }: ApolloServerContextArgs): Promise<Context> => {
      const defaultCtx = {
        ...initContextCache(),
        edgedb,
        req: request,
        currentSession: { sessionId: null },
        services,
        utils
      }

      const { authorization } = request.headers
      if (authorization === undefined) return defaultCtx

      const isValid = authorization.startsWith('Bearer ')
      if (!isValid) return defaultCtx

      const token = authorization.replace('Bearer', '').trim()
      const decoded = await utils.verifyAccessToken(token)
      return {
        ...defaultCtx,
        currentSession: { sessionId: decoded.sessionId }
      }
    }
  })
}
