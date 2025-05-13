import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id').notNull(),
  providerId: integer('provider_id').notNull(),
  userId: integer('user_id')
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
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const verifications = sqliteTable('verifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  likeKeywords: text('like_keywords').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  likeKeywords: text('like_keywords').notNull(),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  clientId: integer('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_projects_on_client_id').on(table.clientId),
]);

export const missions = sqliteTable('missions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  likeKeywords: text('like_keywords').notNull(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_missions_on_project_id').on(table.projectId),
]);

export const dailyReports = sqliteTable('daily_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reportDate: integer('report_date', { mode: 'timestamp' }),
  impression: text('impression'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  release: integer('release', { mode: 'boolean' }).notNull().default(false),
  remote: integer('remote', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_daily_reports_on_user_id').on(table.userId),
]);

export const dailyReportMissions = sqliteTable('daily_report_missions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workContent: text('work_content').notNull(),
  missionId: integer('mission_id')
    .notNull()
    .references(() => missions.id, { onDelete: 'cascade' }),
  dailyReportId: integer('daily_report_id')
    .notNull()
    .references(() => dailyReports.id, { onDelete: 'cascade' }),
  hours: real('hours'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_daily_report_missions_on_daily_report_id').on(table.dailyReportId),
  index('index_daily_report_missions_on_mission_id').on(table.missionId),
]);

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  dailyReportId: integer('daily_report_id')
    .notNull()
    .references(() => dailyReports.id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_comments_on_daily_report_id').on(table.dailyReportId),
  index('index_comments_on_user_id').on(table.userId),
]);

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  commentId: integer('comment_id')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_notifications_on_user_id').on(table.userId),
  index('index_notifications_on_comment_id').on(table.commentId),
]);

export const weeklyReports = sqliteTable('weekly_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  week: integer('week').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_weekly_reports_on_user_id').on(table.userId),
]);

export const weeklyReportMissions = sqliteTable('weekly_report_missions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weeklyReportId: integer('weekly_report_id')
    .notNull()
    .references(() => weeklyReports.id, { onDelete: 'cascade' }),
  missionId: integer('mission_id')
    .notNull()
    .references(() => missions.id, { onDelete: 'cascade' }),
  hours: real('hours').notNull(),
  workContent: text('work_content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_weekly_report_missions_on_mission_id').on(table.missionId),
  index('index_weekly_report_missions_on_weekly_report_id').on(table.weeklyReportId),
]);

export const troubles = sqliteTable('troubles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryOfTroubleId: integer('category_of_trouble_id')
    .notNull()
    .references(() => categoriesOfTrouble.id, { onDelete: 'cascade' }),
  trouble: text('trouble').notNull(),
  resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_troubles_on_category_of_trouble_id').on(table.categoryOfTroubleId),
  index('index_troubles_on_user_id').on(table.userId),
]);

export const troubleReplies = sqliteTable('trouble_replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  troubleId: integer('trouble_id')
    .notNull()
    .references(() => troubles.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  trouble: text('trouble').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_trouble_reply_on_trouble_id').on(table.troubleId),
  index('index_trouble_reply_on_user_id').on(table.userId),
]);

export const categoriesOfTrouble = sqliteTable('categories_of_trouble', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
});


export const appeals = sqliteTable('appeals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryOfAppealId: integer('category_of_appeal_id')
    .notNull()
    .references(() => categoriesOfAppeal.id, { onDelete: 'cascade' }),
  dailyReportId: integer('daily_report_id')
    .notNull()
    .references(() => dailyReports.id, { onDelete: 'cascade' }),
  appeal: text('appeal').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_appeal_on_category_of_appeal_id').on(table.categoryOfAppealId),
  index('index_appeal_on_dairy_report_id').on(table.dailyReportId),
  index('index_appeal_on_user_id').on(table.userId),
]);

export const appealReplies = sqliteTable('appeal_replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appealId: integer('appeal_id')
    .notNull()
    .references(() => appeals.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  appeal: text('appeal').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
}, (table) => [
  index('index_appeal_reply_on_appeal_id').on(table.appealId),
  index('index_appeal_reply_on_user_id').on(table.userId),
]);

export const categoriesOfAppeal = sqliteTable('categories_of_appeal', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
});
