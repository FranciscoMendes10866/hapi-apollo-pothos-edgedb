import SchemaBuilder from '@pothos/core'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import ValidationPlugin from '@pothos/plugin-validation'
import { Client as DatabaseClient } from 'edgedb'
import { Request } from '@hapi/hapi'

import { Services } from '../index'
import { Utils } from './server'

export class Session {
  sessionId: string | null = null
  constructor (id: string) {
    this.sessionId = id
  }
}

interface Root<T, A> {
  Context: T
  AuthScopes: A
}

export interface Context {
  currentSession: Session
  edgedb: DatabaseClient
  req: Request
  services: Services
  utils: Utils
}

interface AuthScopes {
  isProtected: boolean
}

const builder = new SchemaBuilder<Root<Context, AuthScopes>>({
  plugins: [SimpleObjectsPlugin, ScopeAuthPlugin, ValidationPlugin],
  authScopes: async (context) => ({
    isProtected: context.currentSession?.sessionId !== null
  })
})

builder.queryType({})
builder.mutationType({})

export { builder }
