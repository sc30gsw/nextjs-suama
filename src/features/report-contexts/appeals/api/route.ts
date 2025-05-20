import { Hono } from 'hono'
import { upfetchForDummy } from '~/lib/fetcher'
import { sessionMiddleware } from '~/lib/session-middleware'

const app = new Hono().get('/', sessionMiddleware, async (c) => {
  type Response = {
    todos: {
      id: number
      todo: string
      completed: boolean
      userId: number
    }[]
    total: number
    skip: number
    limit: number
  }

  const todoList = await upfetchForDummy<Response>('/todos')

  const appeals = todoList.todos.map((todo) => ({
    id: crypto.randomUUID(),
    name: todo.todo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  return c.json({ ...todoList, appeals }, 200)
})

export default app
