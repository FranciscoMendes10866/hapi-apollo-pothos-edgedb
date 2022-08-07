import { builder } from '../apollo/builder'

builder.mutationField('createTodo', (t) =>
  t.field({
    type: 'String',
    resolve: () => 'Hello World'
  })
)

builder.queryField('getTodos', (t) =>
  t.field({
    type: 'String',
    resolve: () => 'Hello World'
  })
)
