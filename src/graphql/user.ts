import { ApolloError } from 'apollo-server-core'
import * as z from 'zod'

import { builder } from '../apollo/builder'
import e from '../db'
import { hashPassword, verifyPassword, createRefreshToken, signAccessToken, isRefreshTokenExpired } from '../utils'

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

const authSchema = z.object({
  username: z.string().min(6).max(24),
  password: z.string().min(8).max(24)
})

builder.mutationField('signUp', (t) =>
  t.field({
    type: SignUpResponse,
    args: {
      input: t.arg({
        type: UserInput,
        required: true,
        validate: {
          schema: authSchema
        }
      })
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
      input: t.arg({
        type: UserInput,
        required: true,
        validate: {
          schema: authSchema
        }
      })
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

      const accessToken = await signAccessToken({ sessionId: result.id })
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
    authScopes: {
      isProtected: true
    },
    resolve: async (root, args, ctx) => {
      const userId = ctx.currentSession.sessionId

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

builder.mutationField('refreshToken', (t) =>
  t.field({
    type: SignInResponse,
    args: {
      refreshToken: t.arg.string({
        required: true,
        validate: {
          schema: z.string().min(21)
        }
      })
    },
    authScopes: {
      isProtected: true
    },
    resolve: async (root, args, ctx) => {
      const { refreshToken } = args
      const userId = ctx.currentSession.sessionId as string

      const query = e.select(e.RefreshToken, (token) => ({
        id: true,
        expiresAt: true,
        token: true,
        filter: e.op(token.token, '=', refreshToken)
      }))
      const result = await query.run(ctx.edgedb)

      if (result === null) {
        throw new ApolloError('Refresh token not found')
      }

      const hasExpired = isRefreshTokenExpired(result.expiresAt)
      if (hasExpired) {
        throw new ApolloError('Refresh token expired')
      }

      const remove = e.delete(e.RefreshToken, (token) => ({
        filter: e.op(token.token, '=', refreshToken)
      }))
      const removeResult = await remove.run(ctx.edgedb)

      if (removeResult === null) {
        throw new ApolloError('Refresh token could not be removed')
      }

      const accessToken = await signAccessToken({ sessionId: userId })
      const { token, expiresAt } = await createRefreshToken()

      const insert = e.insert(e.RefreshToken, {
        token,
        expiresAt,
        user: e.select(e.User, (user) => ({
          filter: e.op(user.id, '=', e.uuid(userId))
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

const SignOutResponse = builder.simpleObject('SignOutResponse', {
  fields: (t) => ({
    message: t.string()
  })
})

builder.mutationField('signOut', (t) =>
  t.field({
    type: SignOutResponse,
    args: {
      refreshToken: t.arg.string({
        required: true,
        validate: {
          schema: z.string().min(21)
        }
      })
    },
    authScopes: {
      isProtected: true
    },
    resolve: async (root, args, ctx) => {
      const { refreshToken } = args

      const remove = e.delete(e.RefreshToken, (token) => ({
        filter: e.op(token.token, '=', refreshToken)
      }))
      const removeResult = await remove.run(ctx.edgedb)

      if (removeResult === null) {
        throw new ApolloError('Refresh token could not be removed')
      }

      return { message: 'Logged out successfully' }
    }
  })
)
