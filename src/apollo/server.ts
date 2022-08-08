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
      const defaultCtx = {
        ...initContextCache(),
        edgedb,
        koaCtx: ctx,
        currentSession: { sessionId: null }
      }

      const { authorization } = ctx.headers
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
