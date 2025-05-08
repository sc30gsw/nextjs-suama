import { sql } from 'drizzle-orm'
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const users = sqliteTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').unique(),
    email: text('email').unique(),
    emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
    hashedPassword: text('hashedPassword'),
    image: text('image'),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updateAt: integer('updated_at', { mode: 'timestamp_ms' }).$onUpdate(
      () => new Date(),
    ),
  },
  (user) => [
    uniqueIndex('email').on(user.email),
    uniqueIndex('name').on(user.name),
  ],
)
