import { t } from 'elysia'

export namespace ClientModel {
  export const getClientsQuery = t.Object({
    skip: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    names: t.Optional(t.String()),
    sortBy: t.Optional(t.Union([t.Literal('name')])),
    sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  })

  export type getClientsQuery = typeof getClientsQuery.static

  export const client = t.Object({
    id: t.String(),
    name: t.String(),
    likeKeywords: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
  })

  export type client = typeof client.static

  export const getClientsResponse = t.Object({
    clients: t.Array(client),
    total: t.Number(),
    skip: t.Number(),
    limit: t.Number(),
  })

  export type getClientsResponse = typeof getClientsResponse.static

  export const errorResponse = t.Object({
    error: t.String(),
    code: t.String(),
  })

  export type errorResponse = typeof errorResponse.static
}
