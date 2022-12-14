import e from '../db'
import { edgedb } from '../edgedb'

interface GetUserByUsernameResult {
  id: string
  username: string
  password: string
}

export const findUserByUsername = async (username: string): Promise<GetUserByUsernameResult | null> => {
  const query = e.select(e.User, (user) => ({
    id: true,
    username: true,
    password: true,
    filter: e.op(user.username, '=', username)
  }))
  return await query.run(edgedb)
}

interface InsertionResult {
  id: string
}

export const insertUser = async (username: string, password: string): Promise<InsertionResult | null> => {
  const insert = e.insert(e.User, {
    username,
    password
  })
  return await insert.run(edgedb)
}

export const insertRefreshToken = async (userId: string, token: string, expiresAt: number): Promise<InsertionResult | null> => {
  const insert = e.insert(e.RefreshToken, {
    token,
    expiresAt,
    user: e.select(e.User, (user) => ({
      filter: e.op(user.id, '=', e.uuid(userId))
    }))
  })
  return await insert.run(edgedb)
}

export const findUserById = async (userId: string): Promise<GetUserByUsernameResult | null> => {
  const query = e.select(e.User, (user) => ({
    id: true,
    username: true,
    password: true,
    filter: e.op(user.id, '=', e.uuid(userId))
  }))
  return await query.run(edgedb)
}

interface GetRefreshTokenResult {
  id: string
  token: string
  expiresAt: number
}

export const findRefreshToken = async (refreshToken: string): Promise<GetRefreshTokenResult | null> => {
  const query = e.select(e.RefreshToken, (token) => ({
    id: true,
    expiresAt: true,
    token: true,
    filter: e.op(token.token, '=', refreshToken)
  }))
  return await query.run(edgedb)
}

export const deleteRefreshToken = async (refreshToken: string): Promise<InsertionResult | null> => {
  const remove = e.delete(e.RefreshToken, (token) => ({
    filter: e.op(token.token, '=', refreshToken)
  }))
  return await remove.run(edgedb)
}
