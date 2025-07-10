import { relations } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
})

export const sessions = sqliteTable('sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = sqliteTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
})

export const verifications = sqliteTable('verifications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
})

export const passkeys = sqliteTable('passkeys', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  publicKey: text('public_key').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  credentialID: text('credential_id').notNull(),
  counter: integer('counter').notNull(),
  deviceType: text('device_type').notNull(),
  backedUp: integer('backed_up', { mode: 'boolean' }).notNull(),
  transports: text('transports'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
})

export const clients = sqliteTable(
  'clients',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    likeKeywords: text('like_keywords').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [index('index_clients_on_name_and_like_keywords').on(table.name, table.likeKeywords)],
)

export const projects = sqliteTable(
  'projects',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    likeKeywords: text('like_keywords').notNull(),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_projects_on_client_id').on(table.clientId),
    index('index_projects_on_name_and_like_keywords').on(table.name, table.likeKeywords),
  ],
)

export const missions = sqliteTable(
  'missions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    likeKeywords: text('like_keywords').notNull(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_missions_on_project_id').on(table.projectId),
    index('index_missions_on_name_and_like_keywords').on(table.name, table.likeKeywords),
  ],
)

export const dailyReports = sqliteTable(
  'daily_reports',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reportDate: integer('report_date', { mode: 'timestamp' }),
    impression: text('impression'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    release: integer('release', { mode: 'boolean' }).notNull().default(false),
    remote: integer('remote', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_daily_reports_on_user_id').on(table.userId),
    index('index_daily_reports_on_report_date').on(table.reportDate),
  ],
)

export const dailyReportMissions = sqliteTable(
  'daily_report_missions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workContent: text('work_content').notNull(),
    missionId: text('mission_id')
      .notNull()
      .references(() => missions.id, { onDelete: 'cascade' }),
    dailyReportId: text('daily_report_id')
      .notNull()
      .references(() => dailyReports.id, { onDelete: 'cascade' }),
    hours: real('hours'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_daily_report_missions_on_daily_report_id').on(table.dailyReportId),
    index('index_daily_report_missions_on_mission_id').on(table.missionId),
  ],
)

export const comments = sqliteTable(
  'comments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dailyReportId: text('daily_report_id')
      .notNull()
      .references(() => dailyReports.id, { onDelete: 'cascade' }),
    comment: text('comment').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_comments_on_daily_report_id').on(table.dailyReportId),
    index('index_comments_on_user_id').on(table.userId),
  ],
)

export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    read: integer('read', { mode: 'boolean' }).notNull().default(false),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: text('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_notifications_on_user_id').on(table.userId),
    index('index_notifications_on_comment_id').on(table.commentId),
  ],
)

export const weeklyReports = sqliteTable(
  'weekly_reports',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    year: integer('year').notNull(),
    week: integer('week').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_weekly_reports_on_user_id').on(table.userId),
    index('index_weekly_reports_on_year_and_week').on(table.year, table.week),
  ],
)

export const weeklyReportMissions = sqliteTable(
  'weekly_report_missions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    weeklyReportId: text('weekly_report_id')
      .notNull()
      .references(() => weeklyReports.id, { onDelete: 'cascade' }),
    missionId: text('mission_id')
      .notNull()
      .references(() => missions.id, { onDelete: 'cascade' }),
    hours: real('hours').notNull(),
    workContent: text('work_content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_weekly_report_missions_on_mission_id').on(table.missionId),
    index('index_weekly_report_missions_on_weekly_report_id').on(table.weeklyReportId),
  ],
)

export const troubles = sqliteTable(
  'troubles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryOfTroubleId: text('category_of_trouble_id')
      .notNull()
      .references(() => categoriesOfTrouble.id, { onDelete: 'cascade' }),
    trouble: text('trouble').notNull(),
    resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_troubles_on_category_of_trouble_id').on(table.categoryOfTroubleId),
    index('index_troubles_on_user_id').on(table.userId),
    index('index_troubles_on_resolved').on(table.resolved),
  ],
)

export const troubleReplies = sqliteTable(
  'trouble_replies',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    troubleId: text('trouble_id')
      .notNull()
      .references(() => troubles.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    trouble: text('trouble').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_trouble_reply_on_trouble_id').on(table.troubleId),
    index('index_trouble_reply_on_user_id').on(table.userId),
  ],
)

export const categoriesOfTrouble = sqliteTable(
  'categories_of_trouble',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [index('index_categories_of_trouble_on_name').on(table.name)],
)

export const appeals = sqliteTable(
  'appeals',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryOfAppealId: text('category_of_appeal_id')
      .notNull()
      .references(() => categoriesOfAppeal.id, { onDelete: 'cascade' }),
    dailyReportId: text('daily_report_id')
      .notNull()
      .references(() => dailyReports.id, { onDelete: 'cascade' }),
    appeal: text('appeal').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_appeal_on_category_of_appeal_id').on(table.categoryOfAppealId),
    index('index_appeal_on_dairy_report_id').on(table.dailyReportId),
    index('index_appeal_on_user_id').on(table.userId),
  ],
)

export const appealReplies = sqliteTable(
  'appeal_replies',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    appealId: text('appeal_id')
      .notNull()
      .references(() => appeals.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    appeal: text('appeal').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [
    index('index_appeal_reply_on_appeal_id').on(table.appealId),
    index('index_appeal_reply_on_user_id').on(table.userId),
  ],
)

export const categoriesOfAppeal = sqliteTable(
  'categories_of_appeal',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  },
  (table) => [index('index_categories_of_appeal_on_name').on(table.name)],
)

export const usersRelations = relations(users, ({ many }) => ({
  dailyReports: many(dailyReports),
  weeklyReports: many(weeklyReports),
  troubles: many(troubles),
  appeals: many(appeals),
  comments: many(comments),
  accounts: many(accounts),
  sessions: many(sessions),
  passkeys: many(passkeys),
}))

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  missions: many(missions),
}))

export const missionsRelations = relations(missions, ({ one, many }) => ({
  project: one(projects, {
    fields: [missions.projectId],
    references: [projects.id],
  }),
  dailyReportMissions: many(dailyReportMissions),
  weeklyReportMissions: many(weeklyReportMissions),
}))

export const dailyReportsRelations = relations(dailyReports, ({ one, many }) => ({
  user: one(users, {
    fields: [dailyReports.userId],
    references: [users.id],
  }),
  dailyReportMissions: many(dailyReportMissions),
  appeals: many(appeals),
  comments: many(comments),
}))

export const dailyReportMissionsRelations = relations(dailyReportMissions, ({ one }) => ({
  dailyReport: one(dailyReports, {
    fields: [dailyReportMissions.dailyReportId],
    references: [dailyReports.id],
  }),
  mission: one(missions, {
    fields: [dailyReportMissions.missionId],
    references: [missions.id],
  }),
}))

export const troublesRelations = relations(troubles, ({ one, many }) => ({
  user: one(users, {
    fields: [troubles.userId],
    references: [users.id],
  }),
  categoryOfTrouble: one(categoriesOfTrouble, {
    fields: [troubles.categoryOfTroubleId],
    references: [categoriesOfTrouble.id],
  }),
  troubleReplies: many(troubleReplies),
}))

export const appealsRelations = relations(appeals, ({ one, many }) => ({
  user: one(users, {
    fields: [appeals.userId],
    references: [users.id],
  }),
  categoryOfAppeal: one(categoriesOfAppeal, {
    fields: [appeals.categoryOfAppealId],
    references: [categoriesOfAppeal.id],
  }),
  dailyReport: one(dailyReports, {
    fields: [appeals.dailyReportId],
    references: [dailyReports.id],
  }),
  appealReplies: many(appealReplies),
}))

export const weeklyReportsRelations = relations(weeklyReports, ({ one, many }) => ({
  user: one(users, {
    fields: [weeklyReports.userId],
    references: [users.id],
  }),
  weeklyReportMissions: many(weeklyReportMissions),
}))

export const weeklyReportMissionsRelations = relations(weeklyReportMissions, ({ one }) => ({
  weeklyReport: one(weeklyReports, {
    fields: [weeklyReportMissions.weeklyReportId],
    references: [weeklyReports.id],
  }),
  mission: one(missions, {
    fields: [weeklyReportMissions.missionId],
    references: [missions.id],
  }),
}))
