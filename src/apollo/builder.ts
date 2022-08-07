import SchemaBuilder from '@pothos/core'
import { Client as DatabaseClient } from 'edgedb'

export class Session {
  sessionId?: string
  constructor (id: string) {
    this.sessionId = id
  }
}

interface Root<T> {
  Context: T
}

export interface Context {
  currentSession: Session
  edgedb: DatabaseClient
}

const builder = new SchemaBuilder<Root<Context>>({})

builder.queryType({})
builder.mutationType({})

export { builder }
