import path from 'path'
import fs from 'fs'

import { printSchema, lexicographicSortSchema } from 'graphql'

import { builder } from './builder'
import { env } from '../env'

import '../graphql/user'

export const schema = builder.toSchema({})

if (!env.isProduction && !env.isTest) {
  const schemaAsString = printSchema(lexicographicSortSchema(schema))
  fs.writeFileSync(path.join(process.cwd(), './src/graphql/schema.gql'), schemaAsString)
}
