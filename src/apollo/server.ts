import { Server } from 'http'

import { ApolloServer } from 'apollo-server-koa'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core'
import { initContextCache } from '@pothos/core'
import { Client as DatabaseClient } from 'edgedb'

import { schema } from './schema'
import { Context } from './builder'

interface ApolloServerProps {
  httpServer: Server
  edgedb: DatabaseClient
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
    context: async (): Promise<Context> => {
      return {
        ...initContextCache(),
        currentSession: { sessionId: '123' },
        edgedb
      }
    }
  })
}
