import { Server } from 'http'

import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest'
import supertest from 'supertest'
import { faker } from '@faker-js/faker'

import { startServer } from '../index'

const findUserByUsername = vi.fn()
const deleteRefreshToken = vi.fn()
const findRefreshToken = vi.fn()
const findUserById = vi.fn()
const insertRefreshToken = vi.fn()
const insertUser = vi.fn()

describe('Sign Up Mutation Suite', () => {
  let server: Server
  let username: string
  let password: string

  beforeAll(async () => {
    server = (await startServer({
      deleteRefreshToken,
      findRefreshToken,
      findUserById,
      findUserByUsername,
      insertRefreshToken,
      insertUser
    })).listener
    username = faker.internet.userName()
    password = faker.internet.password(9)
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('Insert New User', async () => {
    await supertest(server)
      .post('/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `
        mutation {
          signUp(input: {
            username: ${username},
            password: ${password}
          }) {
            id
            username
          }
        }
        `
      })
    expect(findUserByUsername.mock.calls.length).toBe(1)
  })
})
