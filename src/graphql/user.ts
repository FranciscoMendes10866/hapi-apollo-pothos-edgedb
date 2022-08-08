import { ApolloError } from 'apollo-server-core'

import { builder } from '../apollo/builder'
import e from '../db'
import { hashPassword, verifyPassword, createRefreshToken, signAccessToken } from '../utils'

const SignUpResponse = builder.simpleObject('SignUpResponse', {
  fields: (t) => ({
    id: t.id(),
    username: t.string()
  })
})

const UserInput = builder.inputType('UserInput', {
  fields: (t) => ({
    username: t.string({ required: true }),
    password: t.string({ required: true })
  })
})

builder.mutationField('signUp', (t) =>
  t.field({
    type: SignUpResponse,
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
      const result = await query.run(ctx.edgedb)

      if (result !== null) {
        throw new ApolloError('User alteady exists')
      }

      const hashedPassword = await hashPassword(password)

      const insert = e.insert(e.User, {
        username,
        password: hashedPassword
      })
      const insertionResult = await insert.run(ctx.edgedb)

      if (insertionResult === null) {
        throw new ApolloError('User account was not created')
      }

      return { id: insertionResult.id, username }
    }
  })
)

const SignInResponse = builder.simpleObject('SignInResponse', {
  fields: (t) => ({
    userId: t.string(),
    accessToken: t.string(),
    refreshToken: t.string()
  })
})

builder.mutationField('signIn', (t) =>
  t.field({
    type: SignInResponse,
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
      const result = await query.run(ctx.edgedb)

      if (result === null) {
        throw new ApolloError('An error happen when fetching the user')
      }

      const isValid = await verifyPassword(result.password, password)
      if (!isValid) {
        throw new ApolloError('Password does not match')
      }

      const accessToken = await signAccessToken({ sessionId: result.id }, result.id)
      const { token, expiresAt } = await createRefreshToken()

      const insert = e.insert(e.RefreshToken, {
        token,
        expiresAt,
        user: e.select(e.User, (user) => ({
          filter: e.op(user.username, '=', username)
        }))
      })
      const insertionResult = await insert.run(ctx.edgedb)

      if (insertionResult === null) {
        throw new ApolloError('User account was not created')
      }

      return { accessToken, refreshToken: token, userId: result.id }
    }
  })
)

builder.queryField('currentUser', (t) =>
  t.field({
    type: SignUpResponse,
    args: {
      userId: t.arg.id({ required: true })
    },
    resolve: async (root, args, ctx) => {
      const { userId } = args

      const query = e.select(e.User, (user) => ({
        id: true,
        username: true,
        password: true,
        filter: e.op(user.id, '=', e.uuid(userId as string))
      }))
      const result = await query.run(ctx.edgedb)

      if (result === null) {
        throw new ApolloError('An error happen when fetching the user')
      }

      return { id: result.id, username: result.username }
    }
  })
)
