import { ApolloError } from 'apollo-server-core'
import * as z from 'zod'

import { builder } from '../apollo/builder'
import * as utils from '../utils'

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
  username: z.string().min(2).max(24),
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

      const result = await ctx.services.findUserByUsername(username)
      if (result !== null) {
        throw new ApolloError('User alteady exists')
      }

      const hashedPassword = await utils.hashPassword(password)

      const insertionResult = await ctx.services.insertUser(username, hashedPassword)
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

      const result = await ctx.services.findUserByUsername(username)
      if (result === null) {
        throw new ApolloError('An error happen when fetching the user')
      }

      const isValid = await utils.verifyPassword(result.password, password)
      if (!isValid) {
        throw new ApolloError('Password does not match')
      }

      const accessToken = await utils.signAccessToken({ sessionId: result.id })
      const { token, expiresAt } = await utils.createRefreshToken()

      const insertionResult = await ctx.services.insertRefreshToken(result.id, token, expiresAt)
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
      const userId = ctx.currentSession.sessionId as string

      const result = await ctx.services.findUserById(userId)
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

      const result = await ctx.services.findRefreshToken(refreshToken)
      if (result === null) {
        throw new ApolloError('Refresh token not found')
      }

      const hasExpired = utils.isRefreshTokenExpired(result.expiresAt)
      if (hasExpired) {
        throw new ApolloError('Refresh token expired')
      }

      const removeResult = await ctx.services.deleteRefreshToken(refreshToken)
      if (removeResult === null) {
        throw new ApolloError('Refresh token could not be removed')
      }

      const accessToken = await utils.signAccessToken({ sessionId: userId })
      const { token, expiresAt } = await utils.createRefreshToken()

      const insertionResult = await ctx.services.insertRefreshToken(userId, token, expiresAt)
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

      const removeResult = await ctx.services.deleteRefreshToken(refreshToken)
      if (removeResult === null) {
        throw new ApolloError('Refresh token could not be removed')
      }

      return { message: 'Logged out successfully' }
    }
  })
)
