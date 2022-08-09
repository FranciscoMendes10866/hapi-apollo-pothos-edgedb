import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import { Server } from 'http'

import { bootstrap } from '../index'

describe('Sign Up Mutation Suite', () => {
  let server: Server

  beforeAll(async () => {
    server = (await bootstrap()).listener
  })

  afterAll(() => {
    server.close()
  })

  it('Insert New User', async () => {
    const res = await supertest(server)
      .post('/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `
        mutation {
          signUp(input: {
            username: "mauricio",
            password: "Hello123"
          }) {
            id
            username
          }
        }
        `
      })
    expect(res.status).toBe(200)
    expect(res.body.data.signUp.username).toEqual('mauricio')
  })
})
