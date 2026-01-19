import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { env } from '~/env'
import { appealPlugin } from '~/features/report-contexts/appeals/api'
import { clientPlugin } from '~/features/report-contexts/clients/api'
import { missionPlugin } from '~/features/report-contexts/missions/api'
import { projectPlugin } from '~/features/report-contexts/projects/api'
import { troublePlugin } from '~/features/report-contexts/troubles/api'
import { dailyReportPlugin } from '~/features/reports/daily/api'
import { weeklyReportPlugin } from '~/features/reports/weekly/api'
import { userPlugin } from '~/features/users/api'

// TODO:Server Componentsの脆弱性のため、一時コメントアウト。v16 のマイグレート時に再度有効化
// export const runtime = 'edge'

export const app = new Elysia({ prefix: '/api' })
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400

        return {
          error: error.message,
          code: 'VALIDATION_ERROR',
        }

      default:
        set.status = 500

        return {
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        }
    }
  })
  .use(
    openapi({
      path: '/openapi',
      documentation: {
        openapi: '3.0.0',
        info: {
          version: '1.0.0',
          title: 'SUAMA that is Work Hours Management & Reporting System API',
          description:
            '業務時間管理・報告システムのREST API仕様です。日報・週報の管理、プロジェクト・ミッション管理などの機能を提供します。',
        },
        servers: [
          {
            url: env.NEXT_PUBLIC_APP_URL,
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'Users', description: 'ユーザー管理' },
          { name: 'Daily Reports', description: '日報管理' },
          { name: 'Weekly Reports', description: '週報管理' },
          { name: 'Projects', description: 'プロジェクト管理' },
          { name: 'Missions', description: 'ミッション管理' },
          { name: 'Clients', description: 'クライアント管理' },
          { name: 'Troubles', description: 'トラブル管理' },
          { name: 'Appeals', description: 'アピール管理' },
        ],
        components: {
          securitySchemes: {
            UserIdAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'Authorization',
              description: 'User ID for authentication',
            },
          },
        },
      },
    }),
  )
  .use(userPlugin)
  .use(dailyReportPlugin)
  .use(weeklyReportPlugin)
  .use(clientPlugin)
  .use(projectPlugin)
  .use(missionPlugin)
  .use(troublePlugin)
  .use(appealPlugin)

export type AppType = typeof app

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch
