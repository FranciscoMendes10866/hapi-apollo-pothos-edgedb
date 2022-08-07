import { createSecretKey } from 'crypto'

import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import * as z from 'zod'
import { hash, verify } from 'argon2'
import { nanoid } from 'nanoid/async'
import dayjs from 'dayjs'

import { env } from './env'
import { Session } from './apollo/builder'

const payloadSchema = z.object({
  // api session properties
  sessionId: z.string().uuid(),
  // jose JWTPayload prorperties
  iss: z.string().optional(),
  sub: z.string().optional(),
  aud: z.union([z.string(), z.string().array()]).optional(),
  jti: z.string().optional(),
  nbf: z.number().optional(),
  exp: z.number().optional(),
  iat: z.number().optional()
})

type AccessTokenPayload = Session & JWTPayload

/**
 * Access Token Utils
 */

export const signAccessToken = async (
  payload: AccessTokenPayload,
  userId: string
): Promise<string> => {
  const secret = createSecretKey(env.JWT_KEY, 'utf-8')
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'AES256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(15 * 60) // 15 minutes
    .setIssuer('koa-pothos')
    .sign(secret)
}

export const verifyAccessToken = async (token: string): Promise<AccessTokenPayload> => {
  const secret = createSecretKey(env.JWT_KEY, 'utf-8')
  const { payload } = await jwtVerify(token, secret)
  return await payloadSchema.parseAsync(payload)
}

/**
 * Refresh Token Utils
 */

interface RefreshTokenPayload {
  token: string
  expiresAt: number
}

export const createRefreshToken = async (): Promise<RefreshTokenPayload> => {
  return {
    token: await nanoid(),
    expiresAt: dayjs().add(7, 'days').unix()
  }
}

export const isRefreshTokenExpired = (expiresAt: number): boolean => {
  return dayjs().isAfter(dayjs.unix(expiresAt))
}

/**
 * Password Utils
 */

export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password)
}

export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  return await verify(hash, password)
}
