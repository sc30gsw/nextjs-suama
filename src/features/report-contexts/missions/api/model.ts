import { t } from 'elysia'

export namespace MissionModel {
  export const getMissionsQuery = t.Object({
    skip: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    names: t.Optional(t.String()),
    archiveStatus: t.Optional(
      t.Union([t.Literal('all'), t.Literal('active'), t.Literal('archived')]),
    ),
    sortBy: t.Optional(t.Union([t.Literal('name'), t.Literal('status'), t.Literal('projectName')])),
    sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  })

  export type getMissionsQuery = typeof getMissionsQuery.static

  export const projectRef = t.Object({
    name: t.String(),
  })

  export type projectRef = typeof projectRef.static

  export const mission = t.Object({
    id: t.String(),
    name: t.String(),
    likeKeywords: t.String(),
    isArchived: t.Boolean(),
    projectId: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
    project: projectRef,
  })

  export type mission = typeof mission.static

  export const getMissionsResponse = t.Object({
    missions: t.Array(mission),
    total: t.Number(),
    skip: t.Number(),
    limit: t.Number(),
  })

  export type getMissionsResponse = typeof getMissionsResponse.static

  export const errorResponse = t.Object({
    error: t.String(),
    code: t.String(),
  })

  export type errorResponse = typeof errorResponse.static
}
