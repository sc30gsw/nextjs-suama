import { t } from 'elysia'

export namespace TroubleModel {
  export const getTroubleCategoriesQuery = t.Object({
    skip: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    names: t.Optional(t.String()),
    withData: t.Optional(t.String()),
    sortBy: t.Optional(t.Union([t.Literal('name')])),
    sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  })

  export type getTroubleCategoriesQuery = typeof getTroubleCategoriesQuery.static

  export const troubleCategory = t.Object({
    id: t.String(),
    name: t.String(),
    createdAt: t.String(),
    updatedAt: t.Nullable(t.String()),
  })

  export type troubleCategory = typeof troubleCategory.static

  export const unresolvedTrouble = t.Object({
    id: t.String(),
    categoryOfTroubleId: t.String(),
    trouble: t.String(),
    resolved: t.Boolean(),
  })

  export type unresolvedTrouble = typeof unresolvedTrouble.static

  export const getTroubleCategoriesResponse = t.Object({
    troubleCategories: t.Array(troubleCategory),
    total: t.Number(),
    skip: t.Number(),
    limit: t.Number(),
    unResolvedTroubles: t.Array(unresolvedTrouble),
  })

  export type getTroubleCategoriesResponse = typeof getTroubleCategoriesResponse.static

  export const errorResponse = t.Object({
    error: t.String(),
    code: t.String(),
  })

  export type errorResponse = typeof errorResponse.static
}
