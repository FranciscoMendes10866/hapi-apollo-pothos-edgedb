## Tech Stack

- [hapi](https://github.com/hapijs/hapi) - http router
- [Apollo Server](https://www.apollographql.com/docs/apollo-server) - graphql server
- [Pothos](https://github.com/hayes/pothos) - code-first graphql schemas
- [ts-standard](https://github.com/standard/ts-standard) - linter and formatter
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - json web token
- [argon2](https://github.com/ranisalt/node-argon2) - (password) hashing
- [zod](https://github.com/colinhacks/zod) - schema validation
- [EdgeDB](https://github.com/edgedb/edgedb) - database
- [Vitest](https://github.com/vitest-dev/vitest) - test runner

and much more, take a look at the `package.json`

## Todo

- [X] - Create database schema [db_schema]
- [X] - Sign up [mutation]
- [X] - Sign in [mutation]
- [X] - Current user [query]
- [X] - Authorization layer [shields]
- [X] - Sign out [mutation]
- [X] - Refresh Token [mutation]
- [X] - All queries and mutations should have their args validated with zod [validation]
- [X] - Add cors protection [api_protection]
- [ ] - Behaviour testing by using vitest and supertest (mock db) [testing]
