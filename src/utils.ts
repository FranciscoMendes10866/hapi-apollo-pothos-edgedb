import * as z from 'zod'
import jwt from 'jsonwebtoken'
import { hash, verify } from 'argon2'
import { nanoid } from 'nanoid/async'
import dayjs from 'dayjs'

import { env } from './env'
import { Session } from './apollo/builder'

const payloadSchema = z.object({
  sessionId: z.string().uuid()
})

/**
 * Access Token Utils
 */

export const signAccessToken = async (
  payload: Session
): Promise<string> => {
  return jwt.sign(payload, env.JWT_KEY, { expiresIn: 15 * 60 })
}

export const verifyAccessToken = async (
  token: string
): Promise<Session> => {
  const payload = jwt.verify(token, env.JWT_KEY)
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

export const verifyPassword = async (
  hash: string,
  password: string
): Promise<boolean> => {
  return await verify(hash, password)
}
