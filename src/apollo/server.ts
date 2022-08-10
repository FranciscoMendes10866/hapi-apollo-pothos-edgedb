import {
  ApolloServer,
  ApolloServerPluginStopHapiServer
} from 'apollo-server-hapi'
import {
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core'
import { initContextCache } from '@pothos/core'
import { Server, Request } from '@hapi/hapi'

import { schema } from './schema'
import { Context } from './builder'
import { Services } from '../index'
import * as utils from '../utils'

interface ApolloServerProps {
  hapiServer: Server
  services: Services
}

interface ApolloServerContextArgs {
  request: Request
}

type APolloServerFn = (args: ApolloServerProps) => ApolloServer

export const apolloServer: APolloServerFn = ({ hapiServer, services }) => {
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
        req: request,
        currentSession: { sessionId: null },
        services
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
