import { ApolloError } from 'apollo-server-core'

import { builder } from '../apollo/builder'
import e from '../db'
import { hashPassword } from '../utils'

class User {
  username: string
  password: string
  constructor (username: string, password: string) {
    this.username = username
    this.password = password
  }
}

const UserInput = builder.inputType('UserInput', {
  fields: (t) => ({
    username: t.string({ required: true }),
    password: t.string({ required: true })
  })
})

builder.mutationField('signUp', (t) =>
  t.field({
    type: User,
    args: {
      input: t.arg({ type: UserInput, required: true })
    },
    resolve: async (root, args, ctx) => {
      const { username, password } = args.input

      const query = e.select(e.User, (user) => ({
        id: true,
        username: true,
        password: true,
        filter: e.op(user.username, '=', username)
      }))

      let result: User | null
      try {
        result = await query.run(ctx.edgedb)
      } catch (error) {
        throw new ApolloError('An error occurred while fetching user information')
      }

      if (result === null) {
        throw new ApolloError('User alteady exists')
      }

      let hashedPassword
      try {
        hashedPassword = await hashPassword(password)
      } catch (error) {
        throw new ApolloError('An error occurred while hashing the password')
      }

      const insert = e.insert(e.User, {
        username,
        password: hashedPassword
      })

      let insertionResult: { id: string } | null
      try {
        insertionResult = await insert.run(ctx.edgedb)
      } catch (error) {
        throw new ApolloError('An error occurred while inserting the user')
      }

      if (insertionResult === null) {
        throw new ApolloError('User account was not created')
      }
    }
  })
)
