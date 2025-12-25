import { t } from 'elysia'

export namespace ProjectModel {
  // Queryスキーマ
  export const getProjectsQuery = t.Object({
    skip: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    names: t.Optional(t.String()),
    archiveStatus: t.Optional(
      t.Union([t.Literal('all'), t.Literal('active'), t.Literal('archived')]),
    ),
    sortBy: t.Optional(t.Union([t.Literal('name'), t.Literal('status'), t.Literal('clientName')])),
    sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  })

  export type getProjectsQuery = typeof getProjectsQuery.static

  // Responseスキーマ
  export const missionRef = t.Object({
    id: t.String(),
  })

  export type missionRef = typeof missionRef.static

  export const clientRef = t.Object({
    id: t.String(),
    name: t.String(),
    likeKeywords: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
  })

  export type clientRef = typeof clientRef.static

  export const project = t.Object({
    id: t.String(),
    name: t.String(),
    likeKeywords: t.String(),
    isArchived: t.Boolean(),
    clientId: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    client: clientRef,
    missions: t.Array(missionRef),
  })

  export type project = typeof project.static

  export const getProjectsResponse = t.Object({
    projects: t.Array(project),
    total: t.Number(),
    skip: t.Number(),
    limit: t.Number(),
  })

  export type getProjectsResponse = typeof getProjectsResponse.static

  // Errorスキーマ
  export const errorResponse = t.Object({
    error: t.String(),
    code: t.String(),
  })

  export type errorResponse = typeof errorResponse.static
}
