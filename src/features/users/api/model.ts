import { t } from 'elysia'

export namespace UserModel {
  export const getUsersQuery = t.Object({
    skip: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    userNames: t.Optional(t.String()),
    retirementStatus: t.Optional(
      t.Union([t.Literal('all'), t.Literal('active'), t.Literal('retired')]),
    ),
    sortBy: t.Optional(t.Union([t.Literal('name'), t.Literal('status')])),
    sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  })

  export type getUsersQuery = typeof getUsersQuery.static

  export const user = t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String(),
    emailVerified: t.Boolean(),
    image: t.Nullable(t.String()),
    isRetired: t.Boolean(),
    role: t.Union([t.Literal('admin'), t.Literal('user')]),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
  })

  export type user = typeof user.static

  export const getUsersResponse = t.Object({
    users: t.Array(user),
    total: t.Number(),
    skip: t.Number(),
    limit: t.Number(),
  })

  export type getUsersResponse = typeof getUsersResponse.static

  export const errorResponse = t.Object({
    error: t.String(),
    code: t.String(),
  })

  export type errorResponse = typeof errorResponse.static
}
