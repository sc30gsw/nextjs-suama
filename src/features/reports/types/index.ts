import type { users } from '~/db/schema'

export type AdditionalVariables = Record<'Variables', Record<'user', typeof users.$inferSelect>>
