import { t } from 'elysia'

export namespace AppealModel {
  export const getAppealCategoriesQuery = t.Object({
    skip: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    names: t.Optional(t.String()),
    withData: t.Optional(t.String()),
    reportId: t.Optional(t.String()),
    sortBy: t.Optional(t.Union([t.Literal('name')])),
    sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  })

  export type getAppealCategoriesQuery = typeof getAppealCategoriesQuery.static

  export const appealCategory = t.Object({
    id: t.String(),
    name: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
  })

  export type appealCategory = typeof appealCategory.static

  export const existingAppeal = t.Object({
    id: t.String(),
    categoryOfAppealId: t.String(),
    appeal: t.String(),
  })

  export type existingAppeal = typeof existingAppeal.static

  export const getAppealCategoriesResponse = t.Object({
    appealCategories: t.Array(appealCategory),
    total: t.Number(),
    skip: t.Number(),
    limit: t.Number(),
    existingAppeals: t.Array(existingAppeal),
  })

  export type getAppealCategoriesResponse = typeof getAppealCategoriesResponse.static

  export const errorResponse = t.Object({
    error: t.String(),
    code: t.String(),
  })

  export type errorResponse = typeof errorResponse.static
}
