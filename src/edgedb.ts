import * as client from 'edgedb'

import { env } from './env'

type DatabaseClient = client.Client

interface SingletonFactoryReturn {
  instanciate: () => DatabaseClient
}

const DatabaseSingletonFactory = ((): SingletonFactoryReturn => {
  let instance: DatabaseClient | undefined

  const createConnection = (): DatabaseClient => {
    return client.createClient({ port: env.BD_PORT, tlsSecurity: 'insecure' })
  }

  return {
    instanciate: (): DatabaseClient => {
      if (instance === undefined) {
        instance = createConnection()
      }
      return instance
    }
  }
})()

export const edgedb = DatabaseSingletonFactory.instanciate()
