import path from 'path'
import fs from 'fs'

import { printSchema, lexicographicSortSchema } from 'graphql'

import { builder } from './builder'
import { env } from '../env'

import '../graphql/user'

export const schema = builder.toSchema({})

const schemaAsString = printSchema(lexicographicSortSchema(schema))

if (!env.isProduction && !env.isTest) {
  fs.writeFileSync(path.join(process.cwd(), './src/graphql/schema.gql'), schemaAsString)
}
