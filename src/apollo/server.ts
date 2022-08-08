import { Server } from 'http'

import { Context as KoaContext } from 'koa'
import { ApolloServer } from 'apollo-server-koa'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core'
import { initContextCache } from '@pothos/core'
import { Client as DatabaseClient } from 'edgedb'

import { schema } from './schema'
import { Context } from './builder'
import { verifyAccessToken } from '../utils'

interface ApolloServerProps {
  httpServer: Server
  edgedb: DatabaseClient
}

interface ApolloServerContextArgs {
  ctx: KoaContext
}

type APolloServerFn = (args: ApolloServerProps) => ApolloServer

export const apolloServer: APolloServerFn = ({ httpServer, edgedb }) => {
  return new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true })
    ],
    context: async ({ ctx }: ApolloServerContextArgs): Promise<Context> => {
      const baseCtx = {
        ...initContextCache(),
        edgedb,
        koaCtx: ctx
      }

      const { authorization } = ctx.headers
      if (authorization === undefined) {
        return {
          ...baseCtx,
          currentSession: { sessionId: null }
        }
      }

      const isValid = authorization.startsWith('Bearer ')
      if (!isValid) {
        return {
          ...baseCtx,
          currentSession: { sessionId: null }
        }
      }

      const token = authorization.replace('Bearer', '').trim()
      const decoded = await verifyAccessToken(token)
      return {
        ...baseCtx,
        currentSession: { sessionId: decoded.sessionId }
      }
    }
  })
}
